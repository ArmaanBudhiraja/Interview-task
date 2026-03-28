<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');

$routes->group('api', static function (RouteCollection $routes): void {
    $routes->options('/', static fn () => service('response')->setStatusCode(204));
    $routes->options('(:any)', static fn () => service('response')->setStatusCode(204));

    $routes->post('register', 'Api\AuthController::register');
    $routes->post('login', 'Api\AuthController::login');

    $routes->group('', ['filter' => 'tokenauth'], static function (RouteCollection $routes): void {
        $routes->get('me', 'Api\AuthController::me');
        $routes->post('logout', 'Api\AuthController::logout');
        $routes->get('auth-users', 'Api\AuthUsersController::index');
        $routes->get('teachers', 'Api\TeachersController::index');
        $routes->post('teacher-records', 'Api\TeachersController::store');
    });
});
