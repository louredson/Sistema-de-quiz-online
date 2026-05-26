<?php

function app_config(): array
{
    static $config = null;

    if ($config !== null) {
        return $config;
    }

    $baseConfig = require __DIR__ . '/config.php';
    $localConfigPath = __DIR__ . '/config.local.php';
    $localConfig = file_exists($localConfigPath) ? require $localConfigPath : [];

    if (!is_array($baseConfig)) {
        $baseConfig = [];
    }

    if (!is_array($localConfig)) {
        $localConfig = [];
    }

    $config = array_merge($baseConfig, $localConfig);
    return $config;
}
