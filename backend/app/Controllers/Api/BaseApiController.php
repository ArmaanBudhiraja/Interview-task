<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Libraries\TokenAuth;
use CodeIgniter\API\ResponseTrait;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

abstract class BaseApiController extends BaseController
{
    use ResponseTrait;

    protected TokenAuth $tokenAuth;

    public function initController(RequestInterface $request, ResponseInterface $response, LoggerInterface $logger)
    {
        parent::initController($request, $response, $logger);

        $this->tokenAuth = new TokenAuth();
    }

    protected function getPayload(): array
    {
        $payload = $this->request->getJSON(true);

        if (is_array($payload) && $payload !== []) {
            return $payload;
        }

        return $this->request->getPost() ?: [];
    }

    protected function validationErrorResponse(): \CodeIgniter\HTTP\ResponseInterface
    {
        return $this->respond([
            'message' => 'Validation failed.',
            'errors' => $this->validator?->getErrors() ?? [],
        ], 422);
    }

    protected function sanitizeUser(array $user): array
    {
        unset($user['password'], $user['api_token_hash'], $user['api_token_expires_at']);

        return $user;
    }

    protected function currentUser(): ?array
    {
        $user = $this->tokenAuth->authenticate($this->request->getHeaderLine('Authorization'));

        return $user === null ? null : $this->sanitizeUser($user);
    }
}
