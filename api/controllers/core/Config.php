<?php 
class Config
{
    private static $config;

    public static function get($key, $default = null)
    {
        if (is_null(self::$config)) {
            $configPath = realpath(__DIR__ . '/../../config.php');

            if ($configPath === false || !file_exists($configPath)) {
                self::$config = [];
            } else {
                self::$config = require $configPath;
            }
        }

        return !empty(self::$config[$key]) ? self::$config[$key] : $default;
    }
}
