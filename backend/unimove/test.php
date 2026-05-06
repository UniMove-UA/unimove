<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$request = Illuminate\Http\Request::create('/api/markers', 'GET', [
    'from' => '38.37,-0.53',
    'to' => '38.40,-0.49'
]);

$response = app()->handle($request);
echo $response->getContent();
