<?php

namespace App\Enums;

enum RegistrationSessionStatus: string
{
    case Draft = 'draft';
    case Open = 'open';
    case Closed = 'closed';
    case Processing = 'processing';
    case Placement = 'placement';
    case Published = 'published';
}
