import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <GraduationCap className="h-20 w-20 text-blue-600 dark:text-blue-400 mb-6" />
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl mb-4">
            School Management System
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mb-8">
            A comprehensive platform for managing academic and operational activities
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-semibold mb-4">Admin Portal</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Manage students, courses, attendance, and more
              </p>
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link href="/auth/login">Login as Admin</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/auth/register">Register as Admin</Link>
                </Button>
              </div>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-semibold mb-4">Student Portal</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Access courses, materials, and track progress
              </p>
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link href="/auth/login">Login as Student</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/auth/register">Register as Student</Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}