<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Students List - {{ $session->name }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
        }
        .header h1 {
            margin: 0 0 5px 0;
            font-size: 18px;
        }
        .header p {
            margin: 0;
            font-size: 11px;
            color: #666;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 6px 8px;
            text-align: left;
            font-size: 10px;
        }
        th {
            background-color: #f5f5f5;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 9px;
        }
        tr:nth-child(even) {
            background-color: #fafafa;
        }
        .status-submitted {
            color: #16a34a;
            font-weight: bold;
        }
        .status-pending {
            color: #ca8a04;
            font-weight: bold;
        }
        .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 10px;
            color: #666;
        }
        .summary {
            margin-bottom: 15px;
            padding: 10px;
            background-color: #f5f5f5;
            border-radius: 4px;
        }
        .summary p {
            margin: 3px 0;
            font-size: 11px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $session->name }}</h1>
        <p>Registration Session Students List</p>
        <p>Generated on {{ now()->format('d M Y, H:i') }}</p>
    </div>

    <div class="summary">
        <p><strong>Total Students:</strong> {{ $students->count() }}</p>
        <p><strong>Submitted:</strong> {{ $students->where('is_submitted', true)->count() }}</p>
        <p><strong>Pending:</strong> {{ $students->where('is_submitted', false)->count() }}</p>
        <p><strong>Session Period:</strong> {{ \Carbon\Carbon::parse($session->start_date)->format('d M Y') }} - {{ \Carbon\Carbon::parse($session->end_date)->format('d M Y') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 5%">#</th>
                <th style="width: 15%">Matric No.</th>
                <th style="width: 25%">Name</th>
                <th style="width: 8%">Gender</th>
                <th style="width: 10%">Race</th>
                <th style="width: 20%">Email</th>
                <th style="width: 9%">Status</th>
                <th style="width: 8%">Submitted</th>
            </tr>
        </thead>
        <tbody>
            @foreach($students as $index => $student)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $student->matric_number }}</td>
                <td>{{ $student->name }}</td>
                <td>{{ ucfirst($student->gender ?? '-') }}</td>
                <td>{{ ucfirst($student->race ?? '-') }}</td>
                <td>{{ $student->email ?? '-' }}</td>
                <td class="{{ $student->is_submitted ? 'status-submitted' : 'status-pending' }}">
                    {{ $student->is_submitted ? 'Submitted' : 'Pending' }}
                </td>
                <td>{{ $student->submitted_at ? \Carbon\Carbon::parse($student->submitted_at)->format('d/m/Y') : '-' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>MyTrek Registration System</p>
    </div>
</body>
</html>