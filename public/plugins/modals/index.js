export default /* @ngInject */ function FilestackModalCtrl (appConfig, $scope) {
  // $scope.url = model.url + '/image'

  let config = {accept: 'image/*', maxFiles: 1, maxSize: 10 * 1000 * 1000}

  $scope.customConfig = config

  $scope.onComplete = function (Blobs) {
    $scope.$close(Blobs)
  }
}
