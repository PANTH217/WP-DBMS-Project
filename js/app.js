
var app = angular.module('roomfixApp', ['ngRoute']);
app.config(['$routeProvider', function($routeProvider) {
  $routeProvider
    .when('/login', {
      templateUrl: 'views/login.html',
      controller: 'LoginCtrl'
    })
    .when('/register', {
      templateUrl: 'views/register.html',
      controller: 'RegisterCtrl'
    })
    .when('/student', {
      templateUrl: 'views/student-dashboard.html',
      controller: 'StudentCtrl'
    })
    .when('/student/submit', {
      templateUrl: 'views/complaint-form.html',
      controller: 'ComplaintFormCtrl'
    })
    .when('/admin', {
      templateUrl: 'views/admin-dashboard.html',
      controller: 'AdminCtrl'
    })
    .when('/profile', {
      templateUrl: 'views/profile.html',
      controller: 'ProfileCtrl'
    })
    .when('/faq', {
      templateUrl: 'views/faq.html',
      controller: 'FAQCtrl'
    })
    .otherwise({
      redirectTo: '/login'
    });
}]);
app.directive('fileInput', function() {
  return {
    restrict: 'A',
    scope: { fileInput: '=' },
    link: function(scope, element) {
      element.on('change', function(event) {
        scope.$apply(function() {
          scope.fileInput = event.target.files[0] || null;
        });
      });
    }
  };
});
app.service('DataService', ['$http', function($http) {
  this.findUser = function(email, password) {
    return $http.post('/api/login', { email: email, password: password }).then(function(res) { return res.data; }).catch(function() { return null; });
  };
  this.emailExists = function(email) {
    return $http.get('/api/checkEmail?email=' + encodeURIComponent(email)).then(function(res) { return res.data.exists; }).catch(function() { return false; });
  };
  this.addUser = function(user) {
    return $http.post('/api/register', user);
  };
  this.getComplaints = function(roomFilter) {
    var user = JSON.parse(localStorage.getItem('roomfix_user'));
    var url  = '/api/complaints';
    if (user && user.role === 'student') {
      url += '?email=' + encodeURIComponent(user.email) + '&role=student';
    }
    return $http.get(url).then(function(res) { return res.data; });
  };
  this.addComplaint = function(complaint) {
    return $http.post('/api/complaints', complaint);
  };
  this.updateStatus = function(complaintId, newStatus) {
    return $http.put('/api/complaints/' + complaintId, { status: newStatus });
  };
  this.getStudents = function() {
    return $http.get('/api/students').then(function(res) { return res.data; });
  };
  this.getNotices = function() {
    return $http.get('/api/notices').then(function(res) { return res.data; });
  };
  this.addNotice = function(notice) {
    return $http.post('/api/notices', notice);
  };
  this.deleteNotice = function(id) {
    return $http.delete('/api/notices/' + id);
  };
}]);
app.controller('MainCtrl', ['$scope', '$rootScope', '$location', function($scope, $rootScope, $location) {
  var saved = localStorage.getItem('roomfix_user');
  $rootScope.currentUser = saved ? JSON.parse(saved) : null;
  $rootScope.isLoggedIn  = $rootScope.currentUser ? true : false;
  $scope.currentUser = $rootScope.currentUser;
  $scope.isLoggedIn  = $rootScope.isLoggedIn;
  $rootScope.$on('loginSuccess', function(e, user) {
    $scope.currentUser = user;
    $scope.isLoggedIn  = true;
  });
  $scope.logout = function() {
    localStorage.removeItem('roomfix_user');
    $rootScope.currentUser = null;
    $rootScope.isLoggedIn  = false;
    $scope.currentUser = null;
    $scope.isLoggedIn  = false;
    $location.path('/login');
  };
}]);
app.controller('LoginCtrl', ['$scope', '$location', '$rootScope', 'DataService', function($scope, $location, $rootScope, DataService) {
  $scope.email    = '';
  $scope.password = '';
  $scope.error    = '';
  $scope.loading  = false;
  if (localStorage.getItem('roomfix_user')) {
    var u = JSON.parse(localStorage.getItem('roomfix_user'));
    $location.path(u.role === 'admin' ? '/admin' : '/student');
  }
  $scope.login = function() {
    $scope.error = '';
    if (!$scope.email || !$scope.password) {
      $scope.error = 'Please enter email and password.';
      return;
    }
    $scope.loading = true;
    DataService.findUser($scope.email, $scope.password).then(function(user) {
      $scope.loading = false;
      if (user) {
        localStorage.setItem('roomfix_user', JSON.stringify(user));
        $rootScope.currentUser = user;
        $rootScope.isLoggedIn  = true;
        $rootScope.$broadcast('loginSuccess', user);
        $location.path(user.role === 'admin' ? '/admin' : '/student');
      } else {
        $scope.error = 'Incorrect email or password.';
      }
    }).catch(function() {
      $scope.loading = false;
      $scope.error = 'Could not connect. Check Atlas credentials.';
    });
  };
}]);
app.controller('RegisterCtrl', ['$scope', '$location', 'DataService', function($scope, $location, DataService) {
  $scope.name    = '';
  $scope.sapid   = '';
  $scope.room    = '';
  $scope.email   = '';
  $scope.error   = '';
  $scope.message = '';
  $scope.loading = false;
  $scope.buildEmail = function() {
    var name  = ($scope.name  || '').trim();
    var sapid = ($scope.sapid || '').trim();
    if (!name || sapid.length < 3) {
      $scope.email = '';
      return;
    }
    var parts = name.toLowerCase().split(/\s+/);
    var firstName = parts[0] || '';
    var lastName  = parts.slice(1).join('') || '';
    var last3 = sapid.slice(-3);
    if (lastName) {
      $scope.email = firstName + '.' + lastName + last3 + '@nmims.in';
    } else {
      $scope.email = firstName + last3 + '@nmims.in';
    }
  };
  $scope.register = function() {
    $scope.error   = '';
    $scope.message = '';
    if (!$scope.name || !$scope.sapid || !$scope.room) {
      $scope.error = 'All fields are required.';
      return;
    }
    if (!/^\d{11}$/.test($scope.sapid)) {
      $scope.error = 'SAP ID must be exactly 11 digits.';
      return;
    }
    if (!$scope.email) {
      $scope.buildEmail();
    }
    $scope.loading = true;
    DataService.emailExists($scope.email).then(function(exists) {
      if (exists) {
        $scope.loading = false;
        $scope.error = 'This SAP ID is already registered. Please login.';
        return;
      }
      return DataService.addUser({
        name:     $scope.name,
        email:    $scope.email,
        sapid:    $scope.sapid,
        room:     $scope.room,
        password: $scope.sapid,
        role:     'student',
        registeredAt: new Date().toLocaleDateString('en-IN')
      });
    }).then(function(result) {
      $scope.loading = false;
      if (result !== undefined) {
        $scope.message = 'Registration successful! Redirecting to login...';
        setTimeout(function() {
          $location.path('/login');
          $scope.$apply();
        }, 1500);
      }
    }).catch(function() {
      $scope.loading = false;
      $scope.error = 'Registration failed. Please try again.';
    });
  };
}]);
app.controller('StudentCtrl', ['$scope', '$location', 'DataService', function($scope, $location, DataService) {
  var user = JSON.parse(localStorage.getItem('roomfix_user'));
  if (!user || user.role !== 'student') {
    $location.path('/login');
    return;
  }
  $scope.user         = user;
  $scope.complaints   = [];
  $scope.notices      = [];
  $scope.loading      = true;
  $scope.filterStatus = '';
  $scope.refresh = function() {
    $scope.loading = true;
    DataService.getComplaints(user.room).then(function(list) {
      $scope.complaints = list;
      $scope.loading    = false;
    }).catch(function() {
      $scope.loading = false;
    });
    DataService.getNotices().then(function(notices) {
      $scope.notices = notices;
    });
  };
  $scope.refresh();
  $scope.getFiltered = function() {
    if (!$scope.filterStatus) return $scope.complaints;
    return $scope.complaints.filter(function(c) {
      return c.status === $scope.filterStatus;
    });
  };
  $scope.countByStatus = function(status) {
    return $scope.complaints.filter(function(c) { return c.status === status; }).length;
  };
}]);
app.controller('ComplaintFormCtrl', ['$scope', '$location', 'DataService', function($scope, $location, DataService) {
  var user = JSON.parse(localStorage.getItem('roomfix_user'));
  if (!user || user.role !== 'student') {
    $location.path('/login');
    return;
  }
  $scope.category     = '';
  $scope.description  = '';
  $scope.urgency      = 'Low';
  $scope.error        = '';
  $scope.message      = '';
  $scope.submitting   = false;
  $scope.selectedFile = null;
  $scope.imagePreview = null;
  $scope.fileError    = '';
  $scope.openFilePicker = function() {
    document.getElementById('photoUpload').click();
  };
  $scope.removeImage = function() {
    $scope.selectedFile = null;
    $scope.imagePreview = null;
    $scope.fileError    = '';
    document.getElementById('photoUpload').value = '';
  };
  $scope.$watch('selectedFile', function(file) {
    if (!file) {
      $scope.imagePreview = null;
      return;
    }
    if (!file.type.match('image.*')) {
      $scope.fileError    = 'Only image files are allowed (JPG, PNG, GIF etc.)';
      $scope.selectedFile = null;
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      $scope.fileError    = 'Image size must be less than 2MB.';
      $scope.selectedFile = null;
      return;
    }
    $scope.fileError = '';
    var reader = new FileReader();
    reader.onload = function(e) {
      $scope.$apply(function() {
        $scope.imagePreview = e.target.result;
      });
    };
    reader.readAsDataURL(file);
  });
  $scope.submit = function() {
    $scope.error = '';
    if (!$scope.category || !$scope.description) {
      $scope.error = 'Please fill in category and description.';
      return;
    }
    if (!$scope.selectedFile || !$scope.imagePreview) {
      $scope.error = 'Please attach a photo of the issue. It is required.';
      return;
    }
    $scope.submitting = true;
    var today   = new Date();
    var dateStr = today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear();
    DataService.addComplaint({
      studentName:  user.name,
      email:        user.email,
      room:         user.room,
      category:     $scope.category,
      description:  $scope.description,
      urgency:      $scope.urgency,
      status:       'Pending',
      submittedAt:  dateStr,
      imageData:    $scope.imagePreview,
      imageName:    $scope.selectedFile.name
    }).then(function() {
      $scope.submitting   = false;
      $scope.message      = 'Complaint submitted successfully!';
      $scope.category     = '';
      $scope.description  = '';
      $scope.urgency      = 'Low';
      $scope.selectedFile = null;
      $scope.imagePreview = null;
      setTimeout(function() {
        $location.path('/student');
        $scope.$apply();
      }, 1500);
    }).catch(function() {
      $scope.submitting = false;
      $scope.error = 'Submission failed. Please try again.';
    });
  };
}]);
app.controller('AdminCtrl', ['$scope', '$location', 'DataService', function($scope, $location, DataService) {
  var user = JSON.parse(localStorage.getItem('roomfix_user'));
  if (!user || user.role !== 'admin') {
    $location.path('/login');
    return;
  }
  $scope.user           = user;
  $scope.complaints     = [];
  $scope.students       = [];
  $scope.notices        = [];
  $scope.newNoticeTitle = '';
  $scope.loading        = true;
  $scope.loadingStudents = true;
  $scope.filterCategory = '';
  $scope.filterStatus   = '';
  $scope.activeTab      = 'complaints';
  $scope.refresh = function() {
    $scope.loading = true;
    DataService.getComplaints(null).then(function(list) {
      $scope.complaints = list;
      $scope.loading    = false;
    }).catch(function() {
      $scope.loading = false;
    });
    $scope.loadingStudents = true;
    DataService.getStudents().then(function(list) {
      $scope.students        = list;
      $scope.loadingStudents = false;
    }).catch(function() {
      $scope.loadingStudents = false;
    });
    DataService.getNotices().then(function(list) {
      $scope.notices = list;
    });
  };
  $scope.postNotice = function() {
    if (!$scope.newNoticeTitle) return;
    var today = new Date();
    var dateStr = today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear();
    DataService.addNotice({
      title: $scope.newNoticeTitle,
      date: dateStr
    }).then(function() {
      $scope.newNoticeTitle = '';
      $scope.refresh();
    });
  };
  $scope.deleteNotice = function(id) {
    if (confirm('Are you sure you want to delete this notice?')) {
      DataService.deleteNotice(id).then(function() {
        $scope.refresh();
      });
    }
  };
  $scope.refresh();
  $scope.switchTab = function(tab) { $scope.activeTab = tab; };
  $scope.getFiltered = function() {
    return $scope.complaints.filter(function(c) {
      var catOk  = !$scope.filterCategory || c.category === $scope.filterCategory;
      var statOk = !$scope.filterStatus   || c.status   === $scope.filterStatus;
      return catOk && statOk;
    });
  };
  $scope.countByStatus = function(status) {
    return $scope.complaints.filter(function(c) { return c.status === status; }).length;
  };
  $scope.getBadgeClass = function(status) {
    if (status === 'Pending')     return 'badge badge-pending';
    if (status === 'In Progress') return 'badge badge-progress';
    if (status === 'Resolved')    return 'badge badge-resolved';
    return 'badge';
  };
  $scope.updateStatus = function(complaint) {
    if (!complaint.status) return;
    DataService.updateStatus(complaint._id, complaint.status).then(function() {
    }).catch(function() {
      alert('Status update failed. Please try again.');
    });
  };
  $scope.viewImage = function(imageData) {
    var w = window.open();
    w.document.write('<html><body style="margin:0; background:#222; text-align:center;">');
    w.document.write('<img src="' + imageData + '" style="max-width:100%; margin-top:10px;">');
    w.document.write('</body></html>');
    w.document.close();
  };
}]);
app.controller('ProfileCtrl', ['$scope', '$location', function($scope, $location) {
  var user = JSON.parse(localStorage.getItem('roomfix_user'));
  if (!user) {
    $location.path('/login');
    return;
  }
  $scope.user = user;
}]);
app.controller('FAQCtrl', ['$scope', function($scope) {
}]);
