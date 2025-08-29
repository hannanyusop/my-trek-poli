<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Students List - {{ $session->name }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            margin: 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
        }
        
        .header h1 {
            margin: 0;
            color: #333;
            font-size: 24px;
        }
        
        .header h2 {
            margin: 5px 0;
            color: #666;
            font-size: 16px;
            font-weight: normal;
        }
        
        .session-info {
            margin-bottom: 20px;
            padding: 15px;
            background-color: #f5f5f5;
            border-radius: 5px;
        }
        
        .session-info strong {
            color: #333;
        }
        
        .stats {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            padding: 10px;
            background-color: #e9ecef;
            border-radius: 5px;
        }
        
        .stat-item {
            text-align: center;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            vertical-align: top;
        }
        
        th {
            background-color: #f8f9fa;
            font-weight: bold;
            color: #333;
        }
        
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        
        .status-submitted {
            color: #28a745;
            font-weight: bold;
        }
        
        .status-draft {
            color: #ffc107;
            font-weight: bold;
        }
        
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
        
        .page-break {
            page-break-after: always;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Student Registration List</h1>
        <h2>{{ $session->name }}</h2>
        <p>Generated on {{ now()->format('F j, Y \a\t g:i A') }}</p>
    </div>

    <div class="session-info">
        <p><strong>Session:</strong> {{ $session->name }}</p>
        <p><strong>Description:</strong> {{ $session->description ?? 'N/A' }}</p>
        <p><strong>Start Date:</strong> {{ $session->start_date ? \Carbon\Carbon::parse($session->start_date)->format('F j, Y') : 'N/A' }}</p>
        <p><strong>End Date:</strong> {{ $session->end_date ? \Carbon\Carbon::parse($session->end_date)->format('F j, Y') : 'N/A' }}</p>
    </div>

    <div class="stats">
        <div class="stat-item">
            <strong>{{ $students->count() }}</strong><br>
            Total Students
        </div>
        <div class="stat-item">
            <strong>{{ $students->where('is_submitted', true)->count() }}</strong><br>
            Submitted
        </div>
        <div class="stat-item">
            <strong>{{ $students->where('is_submitted', false)->count() }}</strong><br>
            Draft
        </div>
    </div>

    @if($students->count() > 0)
        <table>
            <thead>
                <tr>
                    <th style="width: 8%;">#</th>
                    <th style="width: 12%;">Matric No.</th>
                    <th style="width: 12%;">IC No.</th>
                    <th style="width: 20%;">Name</th>
                    <th style="width: 8%;">Gender</th>
                    <th style="width: 10%;">Race</th>
                    <th style="width: 10%;">Religion</th>
                    <th style="width: 10%;">Status</th>
                    <th style="width: 10%;">Submitted</th>
                </tr>
            </thead>
            <tbody>
                @foreach($students as $index => $student)
                    <tr>
                        <td>{{ $index + 1 }}</td>
                        <td>{{ $student->matric_number }}</td>
                        <td>{{ $student->identification_number }}</td>
                        <td>{{ $student->name }}</td>
                        <td>{{ $student->gender }}</td>
                        <td>{{ $student->race }}</td>
                        <td>{{ $student->religion }}</td>
                        <td>
                            <span class="{{ $student->is_submitted ? 'status-submitted' : 'status-draft' }}">
                                {{ $student->is_submitted ? 'Submitted' : 'Draft' }}
                            </span>
                        </td>
                        <td>{{ $student->submitted_at ? $student->submitted_at->format('M j, Y') : '-' }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <div style="text-align: center; padding: 40px; color: #666;">
            <p>No students registered for this session yet.</p>
        </div>
    @endif

    <div class="footer">
        <p>This report was generated automatically by the Student Registration System.</p>
        <p>Page generated on {{ now()->format('Y-m-d H:i:s') }}</p>
    </div>
</body>
</html>