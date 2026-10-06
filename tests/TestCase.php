<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Rate limiter memakai cache "array" yang menumpuk antar test dalam 1 proses.
        $this->app->make('cache')->flush();
    }
}
