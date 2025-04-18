'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { CalendarIcon, Search, Download, CheckCircle2, XCircle } from 'lucide-react';

interface Student {
  id: string;
  full_name: string;
  email: string;
  class_number: number;
}

interface Attendance {
  id: string;
  student_id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  student: Student;
}

export default function AttendancePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate, selectedClass]);

  async function fetchAttendance() {
    try {
      setLoading(true);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');

      let query = supabase
        .from('attendance')
        .select(`
          *,
          student:users (
            id,
            full_name,
            email,
            class_number
          )
        `)
        .eq('date', dateStr);

      if (selectedClass !== 'all') {
        query = query.eq('student.class_number', parseInt(selectedClass));
      }

      const { data: attendanceData, error: attendanceError } = await query;

      if (attendanceError) throw attendanceError;

      // Fetch all students for the selected class
      let studentsQuery = supabase
        .from('users')
        .select('*')
        .eq('role', 'student');

      if (selectedClass !== 'all') {
        studentsQuery = studentsQuery.eq('class_number', parseInt(selectedClass));
      }

      const { data: studentsData, error: studentsError } = await studentsQuery;

      if (studentsError) throw studentsError;

      setStudents(studentsData);

      // Merge attendance data with students
      const mergedAttendance = studentsData.map(student => {
        const existingAttendance = attendanceData?.find(a => a.student_id === student.id);
        return existingAttendance || {
          id: '',
          student_id: student.id,
          date: dateStr,
          status: 'absent' as const,
          student: student
        };
      });

      setAttendance(mergedAttendance);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  const handleAttendanceChange = async (studentId: string, status: 'present' | 'absent' | 'late') => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const existingAttendance = attendance.find(a => a.student_id === studentId);

      if (existingAttendance?.id) {
        // Update existing attendance
        const { error } = await supabase
          .from('attendance')
          .update({ status })
          .eq('id', existingAttendance.id);

        if (error) throw error;
      } else {
        // Create new attendance record
        const { error } = await supabase
          .from('attendance')
          .insert({
            student_id: studentId,
            date: dateStr,
            status
          });

        if (error) throw error;
      }

      await fetchAttendance();

      toast({
        title: 'Success',
        description: 'Attendance updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const exportAttendance = () => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const csvContent = [
      ['Name', 'Class', 'Status', 'Date'].join(','),
      ...attendance.map(record => [
        record.student.full_name,
        `Class ${record.student.class_number}`,
        record.status,
        dateStr
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${dateStr}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const filteredAttendance = attendance.filter(record =>
    record.student.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Attendance</h1>
        <Button onClick={exportAttendance}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {[...Array(10)].map((_, i) => (
              <SelectItem key={i + 1} value={String(i + 1)}>
                Class {i + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(selectedDate, 'PPP')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Attendance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredAttendance.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No students found
                </TableCell>
              </TableRow>
            ) : (
              filteredAttendance.map((record) => (
                <TableRow key={record.student_id}>
                  <TableCell className="font-medium">
                    {record.student.full_name}
                  </TableCell>
                  <TableCell>Class {record.student.class_number}</TableCell>
                  <TableCell>{record.student.email}</TableCell>
                  <TableCell className="text-right">
                    <Select
                      value={record.status}
                      onValueChange={(value: 'present' | 'absent' | 'late') => 
                        handleAttendanceChange(record.student_id, value)
                      }
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="present">
                          <div className="flex items-center">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                            Present
                          </div>
                        </SelectItem>
                        <SelectItem value="absent">
                          <div className="flex items-center">
                            <XCircle className="h-4 w-4 text-red-500 mr-2" />
                            Absent
                          </div>
                        </SelectItem>
                        <SelectItem value="late">
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 text-yellow-500 mr-2" />
                            Late
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
