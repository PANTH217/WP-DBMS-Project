
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
      redirectTo: '/admin/complaints'
    })
    .when('/profile', {
      templateUrl: 'views/profile.html',
      controller: 'ProfileCtrl'
    })
    .when('/faq', {
      templateUrl: 'views/faq.html',
      controller: 'FAQCtrl'
    })
    .when('/admin/complaints', {
      templateUrl: 'views/admin-complaints.html',
      controller: 'AdminCtrl'
    })
    .when('/admin/students', {
      templateUrl: 'views/admin-students.html',
      controller: 'AdminCtrl'
    })
    .when('/admin/notices', {
      templateUrl: 'views/admin-notices.html',
      controller: 'AdminCtrl'
    })
    .when('/admin/staff', {
      templateUrl: 'views/admin-staff.html',
      controller: 'AdminCtrl'
    })
    .when('/admin/system', {
      templateUrl: 'views/system-data.html',
      controller: 'AdminCtrl'
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


  this.getHostels = function() { return $http.get('/api/hostels').then(function(res) { return res.data; }); };
  this.getRooms = function() { return $http.get('/api/rooms').then(function(res) { return res.data; }); };
  this.getCategories = function() { return $http.get('/api/categories').then(function(res) { return res.data; }); };
  this.getStaff = function() { return $http.get('/api/staff').then(function(res) { return res.data; }); };
  this.addStaff = function(data) { return $http.post('/api/staff', data); };
  this.deleteStaff = function(id) { return $http.delete('/api/staff/' + id); };
  this.getAssignments = function() { return $http.get('/api/assignments').then(function(res) { return res.data; }); };
  this.addAssignment = function(data) { return $http.post('/api/assignments', data); };
  this.getFeedback = function() { return $http.get('/api/feedback').then(function(res) { return res.data; }); };
  this.addFeedback = function(data) { return $http.post('/api/feedback', data); };
  this.getInventory = function() { return $http.get('/api/inventory').then(function(res) { return res.data; }); };
  this.updateComplaintStatus = function(id, status) {
    return $http.put('/api/complaints/' + id, { status: status });
  };
  this.updateInventory = function(id, quantity) {
    return $http.put('/api/inventory/' + id, { quantity: quantity });
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
  $scope.hostels = [];
  $scope.rooms   = [];
  $scope.selectedHostel = null;
  $scope.selectedRoom   = null;
  $scope.email   = '';
  $scope.error   = '';
  $scope.message = '';
  $scope.loading = false;

  DataService.getHostels().then(function(list) { $scope.hostels = list; });
  DataService.getRooms().then(function(list) { $scope.rooms = list; });

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
    if (!$scope.name || !$scope.sapid || !$scope.selectedRoom) {
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
        room:     $scope.selectedRoom.roomNo,
        roomId:   $scope.selectedRoom._id,
        hostelId: $scope.selectedRoom.hostelId,
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
  $scope.feedbacks    = [];
  $scope.loading      = true;
  $scope.filterStatus = '';

  $scope.assignments  = [];
  $scope.refresh = function() {
    $scope.loading = true;
    DataService.getComplaints(user.room).then(function(list) {
      $scope.complaints = list;
      $scope.loading    = false;
    });
    DataService.getNotices().then(function(notices) { $scope.notices = notices; });
    DataService.getFeedback().then(function(list) { $scope.feedbacks = list; });
    DataService.getAssignments().then(function(list) { $scope.assignments = list; });
  };
  $scope.refresh();

  $scope.hasFeedback = function(complaintId) {
    return $scope.feedbacks.some(function(f) { return f.complaintId === complaintId; });
  };

  $scope.submitRating = function(complaint, rating) {
    if (!rating) {
      alert('Please select a rating value.');
      return;
    }

    var assignment = $scope.assignments.find(function(a) { return a.complaintId === complaint._id; });
    var staffId = assignment ? assignment.staffId : null;

    DataService.addFeedback({
      complaintId: complaint._id,
      staffId: staffId,
      rating: parseInt(rating),
      studentName: user.name,
      comment: 'Resolved successfully'
    }).then(function() {
      alert('Thank you for your feedback!');
      $scope.refresh();
    });
  };

  $scope.getFiltered = function() {
    if (!$scope.filterStatus) return $scope.complaints;
    return $scope.complaints.filter(function(c) { return c.status === $scope.filterStatus; });
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
  $scope.categories   = [];
  $scope.selectedCategory = null;
  $scope.description  = '';
  $scope.urgency      = 'Low';
  $scope.error        = '';
  $scope.message      = '';
  $scope.submitting   = false;
  $scope.selectedFile = null;
  $scope.imagePreview = null;
  $scope.fileError    = '';

  DataService.getCategories().then(function(list) { $scope.categories = list; });

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
    if (!$scope.selectedCategory || !$scope.description) {
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
      roomId:       user.roomId,
      hostelId:     user.hostelId,
      categoryId:   $scope.selectedCategory._id,
      category:     $scope.selectedCategory.name,
      description:  $scope.description,
      urgency:      $scope.urgency,
      status:       'Pending',
      submittedAt:  dateStr,
      imageData:    $scope.imagePreview,
      imageName:    $scope.selectedFile.name
    }).then(function() {
      $scope.submitting   = false;
      $scope.message      = 'Complaint submitted successfully!';
      $scope.selectedCategory = null;
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
  $scope.staff          = [];
  $scope.rooms          = [];
  $scope.hostels        = [];
  $scope.categories     = [];
  $scope.inventory      = [];
  $scope.assignments    = [];
  $scope.feedback       = [];
  
  $scope.newNoticeTitle = '';
  $scope.loading        = true;
  $scope.activeTab      = 'complaints';
  
  $scope.refresh = function() {
    $scope.loading = true;
    

    var pComplaints  = DataService.getComplaints(null);
    var pAssignments = DataService.getAssignments();
    var pStudents    = DataService.getStudents();
    var pNotices     = DataService.getNotices();
    var pStaff       = DataService.getStaff();
    var pRooms       = DataService.getRooms();
    var pHostels     = DataService.getHostels();
    var pCategories  = DataService.getCategories();
    var pInventory   = DataService.getInventory();
    var pFeedback    = DataService.getFeedback();

    Promise.all([
      pComplaints, pAssignments, pStudents, pNotices, pStaff, 
      pRooms, pHostels, pCategories, pInventory, pFeedback
    ]).then(function(results) {
      $scope.$apply(function() {
        var complaints = results[0];
        var assignments = results[1];
        

        complaints.forEach(function(c) {
          var a = assignments.find(function(ass) { return ass.complaintId === c._id; });
          if (a) c.staffId = a.staffId;
        });

        $scope.complaints  = complaints;
        $scope.assignments = assignments;
        $scope.students    = results[2];
        $scope.notices     = results[3];
        $scope.staff       = results[4];
        $scope.rooms       = results[5];
        $scope.hostels     = results[6];
        $scope.categories  = results[7];
        $scope.inventory   = results[8];
        $scope.feedback    = results[9];
        

        $scope.staff.forEach(function(s) {
          var staffFeedbacks = $scope.feedback.filter(function(f) { return f.staffId === s._id; });
          if (staffFeedbacks.length > 0) {
            var sum = staffFeedbacks.reduce(function(acc, f) { return acc + (f.rating || 0); }, 0);
            s.avgRating = (sum / staffFeedbacks.length).toFixed(1);
          } else {
            s.avgRating = 'N/A';
          }
        });

        $scope.loading = false;
      });
    }).catch(function(err) {
      console.error("Data load failed:", err);
      $scope.$apply(function() { $scope.loading = false; });
    });
  };

  $scope.assignStaff = function(complaint, staffId) {
    if (!staffId) return;
    DataService.addAssignment({
      complaintId: complaint._id,
      staffId: staffId,
      assignedAt: new Date().toLocaleString()
    }).then(function() {

      return DataService.updateComplaintStatus(complaint._id, 'In Progress');
    }).then(function() {
      alert('Technician assigned successfully! Status updated to In Progress.');
      $scope.refresh();
    });
  };

  $scope.getStaffName = function(staffId) {
    var s = $scope.staff.find(function(item) { return item._id === staffId; });
    return s ? s.name : 'Unassigned';
  };

  $scope.getFeedbackForComplaint = function(complaintId) {
    return $scope.feedback.find(function(f) { return f.complaintId === complaintId; });
  };

  $scope.postNotice = function() {
    if (!$scope.newNoticeTitle) return;
    var today = new Date();
    var dateStr = today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear();
    DataService.addNotice({ title: $scope.newNoticeTitle, date: dateStr }).then(function() {
      $scope.newNoticeTitle = '';
      $scope.refresh();
    });
  };

  $scope.newStaff = { name: '', phone: '', specialization: '' };
  $scope.addStaff = function() {
    if (!$scope.newStaff.name || !$scope.newStaff.phone || !$scope.newStaff.specialization) {
      alert('Please fill all staff details.');
      return;
    }
    DataService.addStaff($scope.newStaff).then(function() {
      $scope.newStaff = { name: '', phone: '', specialization: '' };
      alert('New staff recruited successfully!');
      $scope.refresh();
    });
  };

  $scope.removeStaff = function(id) {
    if (confirm('Are you sure you want to remove this staff member?')) {
      DataService.deleteStaff(id).then(function() {
        $scope.refresh();
      });
    }
  };

  $scope.deleteNotice = function(id) {
    if (confirm('Are you sure you want to delete this notice?')) {
      DataService.deleteNotice(id).then(function() { $scope.refresh(); });
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
    DataService.updateComplaintStatus(complaint._id, complaint.status);
  };

  $scope.reorderItem = function(item) {
    var fullStock = 100;
    DataService.updateInventory(item._id, fullStock).then(function() {
      item.quantity = fullStock;
      alert('Stock replenished successfully!');
    });
  };

  $scope.useItem = function(item) {
    if (item.quantity > 0) {
      var newQty = item.quantity - 1;
      DataService.updateInventory(item._id, newQty).then(function() {
        item.quantity = newQty;
      });
    }
  };

  $scope.viewImage = function(imageData) {
    var w = window.open();
    w.document.write('<html><body style="margin:0; background:#222; text-align:center;">');
    w.document.write('<img src="' + imageData + '" style="max-width:100%; margin-top:10px;">');
    w.document.write('</body></html>');
    w.document.close();
  };
}]);

app.controller('ProfileCtrl', ['$scope', '$location', 'DataService', function($scope, $location, DataService) {
  var user = JSON.parse(localStorage.getItem('roomfix_user'));
  if (!user) {
    $location.path('/login');
    return;
  }
  $scope.user = user;
  $scope.rating = 5;
  $scope.comment = '';

  $scope.submitFeedback = function(complaint) {
    DataService.addFeedback({
      complaintId: complaint._id,
      rating: $scope.rating,
      comment: $scope.comment,
      studentName: user.name
    }).then(function() {
      alert('Feedback submitted! Thank you.');
      complaint.hasFeedback = true;
    });
  };
}]);

app.controller('FAQCtrl', ['$scope', function($scope) {
}]);
