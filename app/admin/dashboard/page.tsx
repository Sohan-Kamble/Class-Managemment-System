'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  GraduationCap, 
  Calendar, 
  CreditCard,
  BookOpen,
  Bell,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalFees: 0,
    attendanceToday: 0
  });

  const [attendanceData, setAttendanceData] = useState([
    { name: 'Class 1', present: 25, absent: 5 },
    { name: 'Class 2', present: 28, absent: 2 },
    { name: 'Class 3', present: 22, absent: 8 },
    { name: 'Class 4', present: 30, absent: 0 },
    { name: 'Class 5', present: 27, absent: 3 },
  ]);

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        // Fetch total students
        const { count: studentsCount } = await supabase
          .from('users')
          .select('*', { count: 'exact' })
          .eq('role', 'student');

        // Fetch total courses
        const { count: coursesCount } = await supabase
          .from('courses')
          .select('*', { count: 'exact' });

        // Fetch total fees collected
        const { data: feesData } = await supabase
          .from('payments')
          .select('amount')
          .eq('status', 'completed');
        
        const totalFees = feesData?.reduce((sum, payment) => sum + parseFloat(payment.amount), 0) || 0;

        // Fetch today's attendance
        const today = new Date().toISOString().split('T')[0];
        const { count: attendanceCount } = await supabase
          .from('attendance')
          .select('*', { count: 'exact' })
          .eq('date', today)
          .eq('status', 'present');

        setStats({
          totalStudents: studentsCount || 0,
          totalCourses: coursesCount || 0,
          totalFees: totalFees,
          attendanceToday: attendanceCount || 0
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    }

    fetchDashboardStats();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Enrolled students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">Active courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attendanceToday}</div>
            <p className="text-xs text-muted-foreground">Students present today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Fees Collected</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalFees.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Revenue this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Chart */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Class-wise Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="present" fill="hsl(var(--chart-1))" name="Present" />
                <Bar dataKey="absent" fill="hsl(var(--chart-2))" name="Absent" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:bg-accent transition-colors cursor-pointer">
          <CardHeader className="flex flex-row items-center space-x-4">
            <BookOpen className="h-6 w-6" />
            <CardTitle>Manage Courses</CardTitle>
          </CardHeader>
        </Card>

        <Card className="hover:bg-accent transition-colors cursor-pointer">
          <CardHeader className="flex flex-row items-center space-x-4">
            <Bell className="h-6 w-6" />
            <CardTitle>Send Announcement</CardTitle>
          </CardHeader>
        </Card>

        <Card className="hover:bg-accent transition-colors cursor-pointer">
          <CardHeader className="flex flex-row items-center space-x-4">
            <TrendingUp className="h-6 w-6" />
            <CardTitle>View Reports</CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}