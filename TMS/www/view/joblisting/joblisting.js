'use strict';
app.controller('JoblistingListCtrl', ['ENV', '$scope', '$state', '$ionicLoading', '$ionicPopup', '$ionicFilterBar', '$ionicActionSheet', '$cordovaNetwork', '$timeout', 'ApiService', '$ionicPlatform', '$cordovaSQLite', 'SqlService',
    function (ENV, $scope, $state, $ionicLoading, $ionicPopup, $ionicFilterBar, $ionicActionSheet, $cordovaNetwork, $timeout, ApiService, $ionicPlatform, $cordovaSQLite, SqlService) {
        var filterBarInstance = null;
        var dataResults = new Array();
        var hmAemp1WithAido1 = new HashMap();

        var getObjAemp1WithAido1 = function (objAemp1WithAido1) {
            var jobs = {
                key: objAemp1WithAido1.Key,
                DCFlagWithPcsUom: objAemp1WithAido1.DCFlag + ' ' + objAemp1WithAido1.PcsUom,
                time: checkDatetime(objAemp1WithAido1.TimeFrom),
                customer: {
                    name: objAemp1WithAido1.DeliveryToName,
                    address: objAemp1WithAido1.DeliveryToAddress1 + objAemp1WithAido1.DeliveryToAddress2 + objAemp1WithAido1.DeliveryToAddress3 + objAemp1WithAido1.DeliveryToAddress4
                },
                status: {
                    inprocess: is.equal(objAemp1WithAido1.StatusCode, 'POD') ? false : true,
                    success: is.equal(objAemp1WithAido1.StatusCode, 'POD') ? true : false,
                    failed: is.equal(objAemp1WithAido1.StatusCode, 'CANCEL') ? true : false,
                }
            };
            return jobs;
        };

        var getSignature = function (objAemp1Aido1) {
            var objUri = ApiService.Uri(true, '/api/tms/aemp1withaido1/attach');
            objUri.addSearch('Key', objAemp1Aido1.Key);
            objUri.addSearch('TableName', objAemp1Aido1.TableName);
            ApiService.Get(objUri, true).then(function success(result) {
                if (is.not.undefined(result.data.results)) {
                    $scope.signature = result.data.results;
                    var Aemp1WithAido1Filter = "Key='" + objAemp1Aido1.Key + "' and  TableName='" + objAemp1Aido1.TableName + "' "; // not record
                    var objAemp1WithAido1 = {
                        TempBase64: $scope.signature
                    };
                    SqlService.Update('Aemp1_Aido1', objAemp1WithAido1, Aemp1WithAido1Filter).then(function (res) {});
                }
            });
        };

        $scope.showAemp1WithAido1 = function () {
            if (!ENV.fromWeb) {
                if ($cordovaNetwork.isOffline()) {
                    ENV.wifi = false;
                } else {
                    ENV.wifi = true;
                }
            }
            if (ENV.wifi === true) {
                var strSqlFilter = "FilterTime='" + moment(new Date()).format('YYYYMMDD') + "' And DriverCode='" + sessionStorage.getItem("sessionDriverCode") + "'"; // not record
                SqlService.Select('Aemp1_Aido1', '*', strSqlFilter).then(function (results) {
                    if (results.rows.length > 0) {
                        for (var i = 0; i < results.rows.length; i++) {
                            var Aemp1WithAido1 = results.rows.item(i);
                            hmAemp1WithAido1.set(Aemp1WithAido1.Key, Aemp1WithAido1.Key);
                        }
                        var objUri = ApiService.Uri(true, '/api/tms/aemp1withaido1');
                        objUri.addSearch('DriverCode', sessionStorage.getItem("sessionDriverCode"));
                        ApiService.Get(objUri, true).then(function success(result) {
                            var results = result.data.results;
                            if (is.not.empty(results)) {
                                for (var i = 0; i < results.length; i++) {
                                    var objAemp1WithAido1 = results[i];
                                    var jobs = getObjAemp1WithAido1(objAemp1WithAido1);
                                    dataResults = dataResults.concat(jobs);
                                    $scope.jobs = dataResults;
                                    if (!hmAemp1WithAido1.has(objAemp1WithAido1.Key)) {
                                        SqlService.Insert('Aemp1_Aido1', objAemp1WithAido1).then(function (res) {});
                                        getSignature(objAemp1WithAido1);
                                    }
                                }
                            }
                        });
                    } else {
                        var objUri = ApiService.Uri(true, '/api/tms/aemp1withaido1');
                        objUri.addSearch('DriverCode', sessionStorage.getItem("sessionDriverCode"));
                        ApiService.Get(objUri, true).then(function success(result) {
                            var results = result.data.results;
                            if (is.not.empty(results)) {
                                for (var i = 0; i < results.length; i++) {
                                    var objAemp1WithAido1 = results[i];
                                    var jobs = getObjAemp1WithAido1(results[i]);
                                    dataResults = dataResults.concat(jobs);
                                    $scope.jobs = dataResults;
                                    SqlService.Insert('Aemp1_Aido1', objAemp1WithAido1).then(function (res) {});
                                    getSignature(objAemp1WithAido1);

                                }
                            }
                        });
                    }

                });
            } else {
                var strSqlFilter = " FilterTime='" + moment(new Date()).format('YYYYMMDD') + "' And DriverCode='" + sessionStorage.getItem("sessionDriverCode") + "'"; // not record
                SqlService.Select('Aemp1_Aido1', '*', strSqlFilter).then(function (results) {
                    if (results.rows.length > 0) {
                        for (var i = 0; i < results.rows.length; i++) {
                            var objAemp1WithAido1 = getObjAemp1WithAido1(results.rows.item(i));
                            dataResults = dataResults.concat(objAemp1WithAido1);
                        }
                        $scope.jobs = dataResults;
                    }
                });
            }

        };

        $scope.showAemp1WithAido1();

        $scope.RefreshshowAemp1WithAido1 = function () {
            $state.reload(); //刷新 整个页面
            if (!ENV.fromWeb) {
                if ($cordovaNetwork.isOffline()) {
                    ENV.wifi = false;
                } else {
                    ENV.wifi = true;
                }
            }
            if (ENV.wifi === true) {
                SqlService.Del('Aemp1_Aido1').then(function (res) {
                    var strSqlFilter = "FilterTime='" + moment(new Date()).format('YYYYMMDD') + "' And DriverCode='" + sessionStorage.getItem("sessionDriverCode") + "'"; // not record
                    SqlService.Select('Aemp1_Aido1', '*', strSqlFilter).then(function (results) {
                        if (results.rows.length > 0) {
                            for (var i = 0; i < results.rows.length; i++) {
                                var Aemp1WithAido1 = results.rows.item(i);
                                hmAemp1WithAido1.set(Aemp1WithAido1.Key, Aemp1WithAido1.Key);
                            }
                            var objUri = ApiService.Uri(true, '/api/tms/aemp1withaido1');
                            objUri.addSearch('DriverCode', sessionStorage.getItem("sessionDriverCode"));
                            ApiService.Get(objUri, true).then(function success(result) {
                                var results = result.data.results;
                                if (is.not.empty(results)) {
                                    $scope.jobs = '';
                                    for (var i = 0; i < results.length; i++) {
                                        var objAemp1WithAido1 = results[i];
                                        var jobs = getObjAemp1WithAido1(objAemp1WithAido1);
                                        dataResults = dataResults.concat(jobs);
                                        $scope.jobs = dataResults;
                                        if (!hmAemp1WithAido1.has(objAemp1WithAido1.Key)) {
                                            SqlService.Insert('Aemp1_Aido1', objAemp1WithAido1).then(function (res) {});
                                            getSignature(objAemp1WithAido1);
                                        }
                                    }
                                }
                            });
                        } else {
                            var objUri = ApiService.Uri(true, '/api/tms/aemp1withaido1');
                            objUri.addSearch('DriverCode', sessionStorage.getItem("sessionDriverCode"));
                            ApiService.Get(objUri, true).then(function success(result) {
                                var results = result.data.results;
                                if (is.not.empty(results)) {
                                    $scope.jobs = '';
                                    for (var i = 0; i < results.length; i++) {
                                        var objAemp1WithAido1 = results[i];
                                        var jobs = getObjAemp1WithAido1(results[i]);
                                        dataResults = dataResults.concat(jobs);
                                        $scope.jobs = dataResults;
                                        SqlService.Insert('Aemp1_Aido1', objAemp1WithAido1).then(function (res) {});
                                        getSignature(objAemp1WithAido1);
                                    }
                                }
                            });
                        }
                    });
                });
            } else {
                var strSqlFilter = " FilterTime='" + moment(new Date()).format('YYYYMMDD') + "' And DriverCode='" + sessionStorage.getItem("sessionDriverCode") + "'"; // not record
                SqlService.Select('Aemp1_Aido1', '*', strSqlFilter).then(function (results) {
                    if (results.rows.length > 0) {
                        for (var i = 0; i < results.rows.length; i++) {
                            var objAemp1WithAido1 = getObjAemp1WithAido1(results.rows.item(i));
                            dataResults = dataResults.concat(objAemp1WithAido1);
                        }
                        $scope.jobs = dataResults;
                    }
                });
            }
        };

        $scope.returnMain = function () {
            $state.go('index.login', {}, {
                reload: true
            });
        };

        $scope.returnMain = function () {
            $state.go('index.main', {}, {
                reload: true
            });
        };

        $scope.showFilterBar = function () {
            filterBarInstance = $ionicFilterBar.show({
                items: $scope.jobs,
                expression: function (filterText, value, index, array) {
                    return value.key.indexOf(filterText) > -1;
                },
                //filterProperties: ['bookingno'],
                update: function (filteredItems, filterText) {
                    $scope.jobs = filteredItems;
                    if (filterText) {
                        console.log(filterText);
                    }
                }
            });
        };

        $scope.refreshItems = function () {

            if (filterBarInstance) {
                filterBarInstance();
                filterBarInstance = null;
            }
            $timeout(function () {
                $scope.$broadcast('scroll.refreshComplete');
            }, 1000);
        };

        $scope.gotoDetail = function (job) {
            $state.go('jobListingDetail', {
                'key': job.key
            }, {
                reload: true
            });
        };


// $scope.ClickRefresh=function(){
//   $scope.$on('$ionicView.beforeEnter',function(){
//       $scope.showAemp1WithAido1();
//   });
// };
    }
]);

app.controller('JoblistingDetailCtrl', ['ENV', '$scope', '$state', '$ionicActionSheet', '$cordovaSms', '$stateParams', 'ApiService', '$cordovaSQLite', '$ionicPlatform', '$ionicPopup', '$ionicModal', '$ionicLoading', '$cordovaCamera', '$cordovaBarcodeScanner', '$cordovaImagePicker', '$cordovaFile', '$cordovaFileTransfer', '$cordovaNetwork', 'SqlService', 'PopupService',
    function (ENV, $scope, $state, $ionicActionSheet, $cordovaSms, $stateParams, ApiService, $cordovaSQLite, $ionicPlatform, $ionicPopup, $ionicModal, $ionicLoading, $cordovaCamera, $cordovaBarcodeScanner, $cordovaImagePicker, $cordovaFile, $cordovaFileTransfer, $cordovaNetwork, SqlService, PopupService) {
        var canvas = null,
            context = null;
        $scope.capture = null;
        $scope.modal_camera = null;
        $scope.Detail = {
            aemp1WithAido1: {
                Key: $stateParams.key
            },

        };

        $scope.cancelJmjm3s = [{
            text: 'Sender / Receiver Not In',
            value: 'SenderWithReceiver'
        }, {
            text: 'Address Not Correct',
            value: 'Address'
        }, {
            text: 'Goods Not Ready ',
            value: 'Goods'
        }, {
            text: 'Vehicle Breakdown',
            value: 'Vehicle'

        }, {
            text: ' Bad Weather',
            value: ' BadWeather'
        }, {
            text: 'Reassign Driver',
            value: 'ReassignDriver'
        }, {
            text: 'Remark',
            value: 'Remark'
        }];
        $scope.cancelJmjm3sItem = {
            NewItem: 'SenderWithReceiver',
            Remark: '',
        };

        $ionicPlatform.ready(function () {
            var strSqlFilter = "key='" + $scope.Detail.aemp1WithAido1.Key + "' ";
            SqlService.Select('Aemp1_Aido1', '*', strSqlFilter).then(function (results) {
                if (results.rows.length > 0) {
                    $scope.Detail.aemp1WithAido1 = results.rows.item(0);
                }
            });
        });

        var showCamera = function (type) {
            $ionicLoading.show();
            var sourceType = Camera.PictureSourceType.CAMERA;
            if (is.equal(type, 1)) {
                sourceType = Camera.PictureSourceType.SAVEDPHOTOALBUM;
            }
            var options = {
                quality: 100,
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: sourceType,
                allowEdit: false,
                encodingType: Camera.EncodingType.JPEG,
                //targetWidth: 768,
                //targetHeight: 1024,
                mediaType: Camera.MediaType.PICTURE,
                cameraDirection: Camera.Direction.BACK,
                //popoverOptions: new CameraPopoverOptions(300, 300, 100, 100, Camera.PopoverArrowDirection.ARROW_ANY),
                saveToPhotoAlbum: true
                    //correctOrientation:true
            };
            try {
                $cordovaCamera.getPicture(options).then(function (imageUri) {
                    var uri = '';
                    uri = ApiService.Uri(true, '/api/tms/upload/img');
                    uri.addSearch('Key', $scope.Detail.aemp1WithAido1.Key);
                    uri.addSearch('TableName', $scope.Detail.aemp1WithAido1.TableName);
                    var url = ApiService.Url(uri);
                    var filePath = imageUri,
                        trustHosts = true,
                        options = {
                            fileName: moment().format('YYYY-MM-DD-HH-mm-ss').toString() + '.jpg'
                        };
                    $cordovaFileTransfer.upload(url, filePath, options, trustHosts)
                        .then(function (result) {
                            $ionicLoading.hide();
                            PopupService.Info(null, 'Upload Successfully');
                        }, function (err) {
                            $ionicLoading.hide();
                            console.error(err);
                            PopupService.Alert(null, err.message);
                        }, function (progress) {});
                }, function (err) {
                    $ionicLoading.hide();
                });
            } catch (e) {
                $ionicLoading.hide();
                console.error(e);
            }
        };
        $scope.myChannel = {
            // the fields below are all optional
            videoHeight: 480,
            videoWidth: 320,
            video: null // Will reference the video element on success
        };
        $ionicModal.fromTemplateUrl('camera.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modal_camera = modal;
        });
        $scope.$on('$destroy', function () {
            if (is.not.null($scope.modal_camera)) {
                $scope.modal_camera.remove();
            }
        });
        $scope.takePhoto = function () {
            var video = document.getElementById('videoS');
            context.drawImage(video, 0, 0, 320, 480);
            $scope.capture = canvas.toDataURL();
        };
        $scope.reCapture = function () {
            context.clearRect(0, 0, 320, 480);
            $scope.capture = null;
        };
        $scope.showGoogleMaps = function () {
            $state.go('googleMaps', {}, {});
        };
        $scope.uploadPhoto = function () {
            var jsonData = {
                'Base64': $scope.capture,
                'FileName': moment().format('YYYY-MM-DD-HH-mm-ss').toString() + '.jpg'
            };
            var objUri = '';
            objUri = ApiService.Uri(true, '/api/tms/upload/img');
            objUri.addSearch('Key', $scope.Detail.aemp1WithAido1.Key);
            objUri.addSearch('TableName', $scope.Detail.aemp1WithAido1.TableName);
            ApiService.Post(objUri, jsonData, true).then(function success(result) {
                PopupService.Info(null, 'Upload Successfully', '').then(function () {
                    $scope.closeModal();
                });
            });
        };
        $scope.showActionSheet = function () {
            var actionSheet = $ionicActionSheet.show({
                buttons: [{
                    text: 'Camera'
                }, {
                    text: 'From Gallery'
                }],
                //destructiveText: 'Delete',
                titleText: 'Select Picture',
                cancelText: 'Cancel',
                cancel: function () {
                    // add cancel code..
                },
                buttonClicked: function (index) {
                    if (index === 0) {
                        if (!ENV.fromWeb) {
                            showCamera(0);
                        } else {
                            $scope.modal_camera.show();
                            canvas = document.getElementById('canvas1');
                            context = canvas.getContext('2d');
                            $scope.reCapture();
                        }
                    } else if (index === 1) {
                        if (!ENV.fromWeb) {
                            showCamera(1);

                        } else {
                            $state.go('upload', {
                                'Key': $scope.Detail.aemp1WithAido1.Key,
                                'TableName': $scope.Detail.aemp1WithAido1.TableName
                            }, {});
                        }
                    }
                    return true;
                }
            });
        };

        $scope.refresh = function () {
            var objUri = ApiService.Uri(true, '/api/tms/aemp1withaido1');
            objUri.addSearch('DriverCode', sessionStorage.getItem("sessionDriverCode"));
            objUri.addSearch('TableName', $scope.Detail.aemp1WithAido1.TableName);
            objUri.addSearch('Key', $scope.Detail.aemp1WithAido1.Key);
            ApiService.Get(objUri, true).then(function success(result) {
                var results = result.data.results;
                if (is.not.empty(results)) {
                    var obj = results[0];
                    // var objTobk1RmRemark = objTobk1;
                    var filter = " Key='" + obj.Key + "' and TableName='" + obj.TableName + "'";
                    // delete objTobk1RmRemark.Remark;
                    // delete objTobk1RmRemark.Key;
                    delete obj.__type;
                    // if ($scope.Detail.Tobk1.UpdateRemarkFlag === 'Y') {
                    //     objTobk1RmRemark.Remark = $scope.Detail.Tobk1.Remark;
                    //     objTobk1RmRemark.UpdateRemarkFlag = $scope.Detail.Tobk1.UpdateRemarkFlag;
                    // }
                    $scope.Detail.aemp1WithAido1 = obj;
                    SqlService.Update('Aemp1_Aido1', obj, filter).then(function (res) {});

                }
            });
        };

        $scope.closeModal = function () {
            $scope.modal_camera.hide();
        };
        $scope.returnList = function () {
            $state.go('jobListingList', {}, {
                reload: true
            });
        };

        $scope.cancel = function () {
            if (is.not.equal($scope.Detail.aemp1WithAido1.StatusCode, 'POD')) {
                var myPopup = $ionicPopup.show({
                    templateUrl: 'popup-cancel.html',
                    title: 'Select  Item',
                    scope: $scope,
                    buttons: [{
                        text: 'Cancel',
                        onTap: function (e) {}
                    }, {
                        text: 'Save',
                        type: 'button-positive',
                        onTap: function (e) {
                            for (var i in $scope.cancelJmjm3s) {
                                if ($scope.cancelJmjm3sItem.NewItem === $scope.cancelJmjm3s[i].value) {
                                    $scope.Detail.aemp1WithAido1.CancelDescription = $scope.cancelJmjm3s[i].text;
                                    if ($scope.cancelJmjm3sItem.NewItem === "Remark") {
                                        $scope.Detail.aemp1WithAido1.CancelDescription = $scope.cancelJmjm3sItem.Remark;
                                    }
                                }
                            }
                            var UpdatedValue = 'Y';
                            if (!ENV.fromWeb) {
                                if ($cordovaNetwork.isOffline()) {
                                    ENV.wifi = false;
                                    UpdatedValue = 'N';
                                } else {
                                    ENV.wifi = true;
                                }
                            }
                            var Aemp1WithAido1Filter = "Key='" + $scope.Detail.aemp1WithAido1.Key + "' and  TableName='" + $scope.Detail.aemp1WithAido1.TableName + "' "; // not record
                            var objAemp1WithAido1 = {
                                Remark: $scope.Detail.aemp1WithAido1.Remark,
                                CancelDescription: $scope.Detail.aemp1WithAido1.CancelDescription,
                                StatusCode: 'CANCEL',
                                UpdatedFlag: UpdatedValue
                            };
                            SqlService.Update('Aemp1_Aido1', objAemp1WithAido1, Aemp1WithAido1Filter).then(function (res) {
                                if (UpdatedValue === 'Y' && is.not.undefined(res)) {
                                    $scope.Detail.aemp1WithAido1.StatusCode = 'CANCEL';
                                    var arrAem1WithAido1 = [];
                                    arrAem1WithAido1.push($scope.Detail.aemp1WithAido1);
                                    var jsonData = {
                                        "UpdateAllString": JSON.stringify(arrAem1WithAido1)
                                    };
                                    var objUri = ApiService.Uri(true, '/api/tms/aemp1withaido1/update');
                                    ApiService.Post(objUri, jsonData, true).then(function success(result) {
                                        PopupService.Info(null, 'Cancel Success', '').then(function (res) {
                                            $scope.returnList();
                                        });
                                    });
                                } else if (UpdatedValue === 'N') {
                                    PopupService.Info(null, 'Cancel Success', '').then(function (res) {
                                        $scope.returnList();
                                    });
                                }
                            });

                        }
                    }]
                });
            } else {
                $scope.returnList();
            }
        };

        $scope.gotoConfirm = function () {
            var Aemp1WithAido1Filter = "Key='" + $scope.Detail.aemp1WithAido1.Key + "' and  TableName='" + $scope.Detail.aemp1WithAido1.TableName + "' "; // not record
            var objAemp1WithAido1 = {
                Remark: $scope.Detail.aemp1WithAido1.Remark
            };
            SqlService.Update('Aemp1_Aido1', objAemp1WithAido1, Aemp1WithAido1Filter).then(function (res) {});
            $state.go('jobListingConfirm', {
                'key': $scope.Detail.aemp1WithAido1.Key
            }, {
                reload: true
            });
        };

    }
]);

app.controller('JoblistingConfirmCtrl', ['ENV', '$scope', '$state', '$stateParams', 'ApiService', '$ionicPopup', '$ionicPlatform', '$cordovaSQLite', '$cordovaNetwork', '$ionicLoading', 'SqlService', 'PopupService',
    function (ENV, $scope, $state, $stateParams, ApiService, $ionicPopup, $ionicPlatform, $cordovaSQLite, $cordovaNetwork, $ionicLoading, SqlService, PopupService) {
        var canvas = document.getElementById('signatureCanvas'),
            signaturePad = new SignaturePad(canvas),
            strEemptyBase64 = '';
        $scope.signature = null;
        $scope.Confirm = {
            aemp1WithAido1: {
                Key: $stateParams.key
            }
        };

        $ionicPlatform.ready(function () {
            var strSqlFilter = "key='" + $scope.Confirm.aemp1WithAido1.Key + "' ";
            SqlService.Select('Aemp1_Aido1', '*', strSqlFilter).then(function (results) {
                if (results.rows.length > 0) {
                    $scope.Confirm.aemp1WithAido1 = results.rows.item(0);
                    showRaido();
                    if ($scope.Confirm.aemp1WithAido1.TempBase64 !== null && is.not.empty($scope.Confirm.aemp1WithAido1.TempBase64)) {
                        if (is.not.equal(strEemptyBase64, $scope.Confirm.aemp1WithAido1.TempBase64)) {
                            $scope.signature = 'data:image/png;base64,' + $scope.Confirm.aemp1WithAido1.TempBase64;
                        }
                    }
                }
            });
        });

        var showRaido = function () {
            $scope.OnBehalfOfs = [{
                text: 'Name :' + $scope.Confirm.aemp1WithAido1.DeliveryToName,
                value: 'CustomerCode'
            }, {
                text: 'On Behalf Of : ',
                value: 'OnBehalfOf'
            }, ];
            $scope.OnBehalfOfItem = {
                NewItem: 'CustomerCode',
                BehalfName: $scope.Confirm.aemp1WithAido1.SignBy,
            };
        };
        $scope.serverSideChange = function (item) {
            if ($scope.OnBehalfOfItem.NewItem === item.value) {
                $scope.Confirm.aemp1WithAido1.OnBehalfName = "";
                if ($scope.OnBehalfOfItem.NewItem === "OnBehalfOf") {
                    $scope.Confirm.aemp1WithAido1.OnBehalfName = $scope.OnBehalfOfItem.BehalfName;
                }
            }

        };

        function resizeCanvas() {
            var ratio = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth - 50;
            canvas.height = screen.height / 3;
        }
        var getSignature = function () {

        };
        $scope.returnList = function () {
            $state.go('jobListingList', {}, {});
        };
        $scope.returnDetail = function () {
            $state.go('jobListingDetail', {
                'key': $scope.Confirm.aemp1WithAido1.Key
            }, {
                reload: true
            });
        };
        $scope.clearCanvas = function () {
            $scope.signature = null;
            signaturePad.clear();
        };
        $scope.saveCanvas = function () {
            var sigImg = signaturePad.toDataURL();
            if (is.not.equal(strEemptyBase64, sigImg)) {
                $scope.signature = sigImg;
            }
        };
        $scope.confirm = function () {
            $scope.saveCanvas();
            var signature = '';
            if (is.not.null($scope.signature)) {
                signature = $scope.signature.split(',')[1];
            }
            if ($scope.OnBehalfOfItem.NewItem === 'CustomerCode') {
                $scope.Confirm.aemp1WithAido1.SignBy = $scope.Confirm.aemp1WithAido1.DeliveryToName;
            } else {
                $scope.Confirm.aemp1WithAido1.SignBy = $scope.OnBehalfOfItem.BehalfName;
            }
            var UpdatedValue = 'Y';
            if (!ENV.fromWeb) {
                if ($cordovaNetwork.isOffline()) {
                    ENV.wifi = false;
                    UpdatedValue = 'N';
                } else {
                    ENV.wifi = true;
                }
            }
            var Aemp1WithAido1Filter = "Key='" + $scope.Confirm.aemp1WithAido1.Key + "' and  TableName='" + $scope.Confirm.aemp1WithAido1.TableName + "' "; // not record
            var objAemp1WithAido1 = {
                StatusCode: 'POD',
                TempBase64: signature,
                UpdatedFlag: UpdatedValue,
                SignBy: $scope.Confirm.aemp1WithAido1.SignBy
            };
            SqlService.Update('Aemp1_Aido1', objAemp1WithAido1, Aemp1WithAido1Filter).then(function (res) {});
            if (UpdatedValue === 'Y') {
                var objUri = ApiService.Uri(true, '/api/tms/aemp1withaido1/confirm');
                objUri.addSearch('TableName', $scope.Confirm.aemp1WithAido1.TableName);
                objUri.addSearch('Remark', $scope.Confirm.aemp1WithAido1.Remark);
                objUri.addSearch('Key', $scope.Confirm.aemp1WithAido1.Key);
                objUri.addSearch('SignBy', $scope.Confirm.aemp1WithAido1.SignBy);
                ApiService.Get(objUri, true).then(function success(result) {});
                var jsonData = {
                    'Base64': $scope.signature,
                    'FileName': 'signature.Png'
                };
                if ($scope.signature !== null && is.not.equal($scope.signature, '') && is.not.undefined($scope.signature)) {
                    objUri = ApiService.Uri(true, '/api/tms/upload/img');
                    objUri.addSearch('Key', $scope.Confirm.aemp1WithAido1.Key);
                    objUri.addSearch('TableName', $scope.Confirm.aemp1WithAido1.TableName);
                    ApiService.Post(objUri, jsonData, true).then(function success(result) {});
                }
            }
            PopupService.Info(null, 'Confirm Success', '').then(function (res) {
                $scope.returnList();
            });
        };
        getSignature();
        resizeCanvas();
        strEemptyBase64 = signaturePad.toDataURL();

    }
]);

app.controller('UploadCtrl', ['ENV', '$scope', '$state', '$stateParams', '$ionicPopup', 'FileUploader', 'ApiService', 'PopupService',
    function (ENV, $scope, $state, $stateParams, $ionicPopup, FileUploader, ApiService, PopupService) {
        $scope.UploadPhoto = {
            Key: $stateParams.Key,
            TableName: $stateParams.TableName
        };
        $scope.returnDoc = function () {
            $state.go('jobListingDetail', {
                'key': $scope.UploadPhoto.Key
            }, {
                reload: true
            });
        };
        var uri = '';
        uri = ApiService.Uri(true, '/api/tms/upload/img');
        uri.addSearch('Key', $scope.UploadPhoto.Key);
        uri.addSearch('TableName', $scope.UploadPhoto.TableName);
        var uploader = $scope.uploader = new FileUploader({
            url: ApiService.Url(uri)
        });
        uploader.onSuccessItem = function (fileItem, response, status, headers) {
            console.info('onSuccessItem', fileItem, response, status, headers);
            PopupService.Info(null, 'Upload Successfully', '').then(function (res) {
                $scope.returnDoc();
            });
        };
    }
]);
