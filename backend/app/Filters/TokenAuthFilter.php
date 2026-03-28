<?php

namespace App\Filters;

use App\Libraries\TokenAuth;
use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

class TokenAuthFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        $tokenAuth = new TokenAuth();
        $user = $tokenAuth->authenticate($request->getHeaderLine('Authorization'));

        if ($user !== null) {
            return null;
        }

        return service('response')
            ->setStatusCode(401)
            ->setJSON([
                'message' => 'Missing or invalid bearer token.',
            ]);
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        return null;
    }
}
