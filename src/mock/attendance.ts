import type { AttendanceRecord } from '@/types/attendance'

const employees = [
  { id: 'AST-0001', name: 'Rishabh Jain' },
  { id: 'AST-0002', name: 'Sneha Iyer' },
  { id: 'AST-0003', name: 'Deepak Gupta' },
  { id: 'AST-0004', name: 'Priya Nair' },
  { id: 'AST-0005', name: 'Ananya Sharma' },
  { id: 'AST-0006', name: 'Vikram Patel' },
  { id: 'AST-0007', name: 'Rahul Mehra' },
  { id: 'AST-0008', name: 'Kavita Reddy' },
  { id: 'AST-0009', name: 'Arun Kumar' },
  { id: 'AST-0010', name: 'Meghna Das' },
  { id: 'AST-0011', name: 'Siddharth Rao' },
  { id: 'AST-0012', name: 'Nisha Verma' },
  { id: 'AST-0013', name: 'Karthik Menon' },
  { id: 'AST-0014', name: 'Pooja Hegde' },
  { id: 'AST-0015', name: 'Amit Tiwari' },
  { id: 'AST-0016', name: 'Swati Mishra' },
  { id: 'AST-0017', name: 'Rohan Kapoor' },
  { id: 'AST-0018', name: 'Divya Krishnan' },
  { id: 'AST-0019', name: 'Nikhil Sinha' },
  { id: 'AST-0020', name: 'Tanvi Bhat' },
]

function generateRecords(): AttendanceRecord[] {
  const records: AttendanceRecord[] = []
  let counter = 1

  const startDate = new Date('2026-02-09')
  const endDate = new Date('2026-03-11')

  for (const emp of employees) {
    const current = new Date(startDate)
    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0]
      const dayOfWeek = current.getDay()

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        current.setDate(current.getDate() + 1)
        continue
      }

      const rand = Math.random()
      let status: AttendanceRecord['status']
      let checkIn: string | undefined
      let checkOut: string | undefined
      let totalHours: number | undefined
      let workLocation: AttendanceRecord['workLocation'] = 'Office'
      let notes: string | undefined
      let isEdited = false
      let editedBy: string | undefined
      let editReason: string | undefined
      let source: AttendanceRecord['source'] = 'System'

      if (rand < 0.60) {
        status = 'PRESENT'
        const hour = 8 + Math.floor(Math.random() * 2)
        const min = Math.floor(Math.random() * 30)
        checkIn = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`
        const outHour = hour + 8 + Math.floor(Math.random() * 2)
        const outMin = Math.floor(Math.random() * 60)
        checkOut = `${String(Math.min(outHour, 21)).padStart(2, '0')}:${String(outMin).padStart(2, '0')}`
        totalHours = Math.min(outHour, 21) - hour + (outMin - min) / 60
        totalHours = Math.round(totalHours * 10) / 10
      } else if (rand < 0.70) {
        status = 'LATE'
        const hour = 10 + Math.floor(Math.random() * 2)
        const min = Math.floor(Math.random() * 30)
        checkIn = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`
        const outHour = hour + 8
        const outMin = Math.floor(Math.random() * 60)
        checkOut = `${String(Math.min(outHour, 21)).padStart(2, '0')}:${String(outMin).padStart(2, '0')}`
        totalHours = Math.min(outHour, 21) - hour + (outMin - min) / 60
        totalHours = Math.round(totalHours * 10) / 10
        notes = 'Late arrival due to traffic'
      } else if (rand < 0.85) {
        status = 'WFH'
        checkIn = '09:00'
        checkOut = '18:00'
        totalHours = 9
        workLocation = 'WFH'
      } else if (rand < 0.90) {
        status = 'HALF_DAY'
        checkIn = '09:00'
        checkOut = '13:00'
        totalHours = 4
        notes = 'Half day - personal work'
      } else if (rand < 0.95) {
        status = 'ABSENT'
        notes = 'Unplanned absence'
      } else {
        status = 'ON_LEAVE'
        notes = 'On approved leave'
      }

      if (counter % 20 === 0 && status !== 'ABSENT' && status !== 'ON_LEAVE') {
        isEdited = true
        editedBy = 'usr-002'
        editReason = 'Corrected check-in time as per employee request'
        source = 'Admin'
      }

      records.push({
        id: `att-${String(counter).padStart(4, '0')}`,
        employeeId: emp.id,
        employeeName: emp.name,
        date: dateStr,
        checkInTime: checkIn,
        checkOutTime: checkOut,
        totalHours,
        status,
        workLocation,
        notes,
        isEdited,
        editedBy,
        editReason,
        source,
      })

      counter++
      current.setDate(current.getDate() + 1)
    }
  }

  return records
}

export const mockAttendanceRecords: AttendanceRecord[] = generateRecords()
