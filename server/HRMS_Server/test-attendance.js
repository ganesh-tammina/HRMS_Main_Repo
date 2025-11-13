const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'hrms_master_data'
};

async function verifyAttendanceData() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🔗 Connected to database');

    // Get a sample employee ID first
    const [employees] = await connection.query('SELECT id FROM employees LIMIT 5');
    
    if (employees.length === 0) {
      console.log('❌ No employees found in database');
      return;
    }

    console.log(`\n📊 Found ${employees.length} employees. Testing attendance data...\n`);

    for (const employee of employees) {
      const employeeId = employee.id;
      
      // Get last 10 days of attendance for this employee
      const [attendanceRecords] = await connection.query(`
        SELECT 
          attendance_date,
          check_in,
          check_out,
          DATE_FORMAT(attendance_date, '%Y-%m-%d') as formatted_date,
          DAYNAME(attendance_date) as day_name,
          attendance_id
        FROM attendance 
        WHERE employee_id = ? 
        AND attendance_date >= DATE_SUB(CURDATE(), INTERVAL 10 DAY)
        ORDER BY attendance_date DESC
      `, [employeeId]);

      console.log(`\n👤 EMPLOYEE ID: ${employeeId}`);
      console.log('=' .repeat(70));
      
      if (attendanceRecords.length === 0) {
        console.log('   ⚠️  No attendance records found for last 10 days');
        continue;
      }

      console.log(`   📅 Found ${attendanceRecords.length} attendance records:`);
      console.log('');

      attendanceRecords.forEach((record, index) => {
        const date = record.formatted_date;
        const dayName = record.day_name;
        const checkIn = record.check_in || '❌ Not clocked in';
        const checkOut = record.check_out || '❌ Not clocked out';
        const attendanceId = record.attendance_id;
        
        console.log(`   ${index + 1}. ${date} (${dayName}) [ID: ${attendanceId}]`);
        console.log(`      ⏰ Check In:  ${checkIn}`);
        console.log(`      ⏰ Check Out: ${checkOut}`);
        
        // Check if this is showing different times for different days
        if (index > 0) {
          const prevRecord = attendanceRecords[index - 1];
          if (record.check_in === prevRecord.check_in && 
              record.check_out === prevRecord.check_out &&
              record.formatted_date !== prevRecord.formatted_date) {
            console.log(`      ⚠️  WARNING: Same timings as previous day!`);
          }
        }
        console.log('');
      });

      // Check for duplicate timings across different dates
      const uniqueTimings = new Set();
      const duplicates = [];
      
      attendanceRecords.forEach(record => {
        const timing = `${record.check_in}-${record.check_out}`;
        if (uniqueTimings.has(timing) && record.check_in && record.check_out) {
          duplicates.push({
            date: record.formatted_date,
            timing: timing
          });
        }
        uniqueTimings.add(timing);
      });

      if (duplicates.length > 0) {
        console.log(`   🚨 DUPLICATE TIMINGS DETECTED:`);
        duplicates.forEach(dup => {
          console.log(`      - ${dup.date}: ${dup.timing}`);
        });
      } else {
        console.log(`   ✅ All attendance records have unique timings per date`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the verification
verifyAttendanceData();