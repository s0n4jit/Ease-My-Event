import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowLeft, Search, Users, ShieldAlert, ToggleLeft, ToggleRight } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Card } from '#/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '#/components/ui/table'
import { Input } from '#/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '#/components/ui/select'
import { Navbar } from '#/components/shared/Navbar'
import { Footer } from '#/components/shared/Footer'
import { EmptyState } from '#/components/shared/EmptyState'
import { PageLoader } from '#/components/shared/LoadingSpinner'
import { AuthGuard } from '#/components/auth/AuthGuard'
import { useAuth } from '#/hooks/use-auth'
import { useAllUsers, useUpdateUserRole, useToggleUserActive } from '#/hooks/use-admin'
import { Badge } from '#/components/ui/badge'
import { toast } from 'sonner'

export const Route = createFileRoute('/admin/users')({
  meta: () => [
    { title: 'User Management | EaseMyEvent' },
    { name: 'robots', content: 'noindex, nofollow' }
  ],
  component: () => (
    <AuthGuard allowedRoles={['admin']}>
      <AdminUserManagementPage />
    </AuthGuard>
  ),
})

function AdminUserManagementPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const { data: users, isLoading, refetch } = useAllUsers(searchTerm)
  
  const updateUserRole = useUpdateUserRole()
  const toggleUserActive = useToggleUserActive()

  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <Navbar />
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <ShieldAlert className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground mt-2">Only system administrators can access the admin control panel.</p>
          <Link to="/" className="mt-6 no-underline inline-block">
            <Button>Go Home</Button>
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await updateUserRole.mutateAsync({ id: userId, role })
      toast.success('User privilege updated successfully!')
      refetch()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update privilege')
    }
  }

  const handleActiveToggle = async (userId: string, isActive: boolean) => {
    try {
      await toggleUserActive.mutateAsync({ id: userId, is_active: !isActive })
      toast.success(isActive ? 'User account suspended successfully!' : 'User account enabled successfully!')
      refetch()
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle account activation state')
    }
  }

  if (isLoading) return <><Navbar /><PageLoader /><Footer /></>

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
      <div>
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link to="/admin" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">Manage Users</h1>
                <p className="text-muted-foreground text-sm mt-1">Audit privileges, adjust roles, or toggle suspension states for platform users</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-6 max-w-md">
            <Search className="h-4 w-4 text-muted-foreground shrink-0 ml-3 absolute" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10"
            />
          </div>

          {users && users.length > 0 ? (
            <Card className="border-border/50 shadow-sm overflow-hidden bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User Details</TableHead>
                    <TableHead>Registered Date</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Privilege Level Adjustment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-violet-100 dark:bg-violet-950/40 text-violet-600 flex items-center justify-center font-bold text-xs shrink-0">
                            {item.avatar_url ? (
                              <img src={item.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                            ) : (
                              item.full_name?.charAt(0) || 'U'
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-xs text-foreground/90">{item.full_name || 'Anonymous User'}</p>
                            <p className="text-[10px] text-muted-foreground">{item.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={`border-none capitalize ${
                          item.role === 'admin'
                            ? 'bg-rose-500 text-white'
                            : item.role === 'organiser'
                            ? 'bg-violet-600 text-white'
                            : 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                        }`}>
                          {item.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select value={item.role} onValueChange={(val) => handleRoleChange(item.id, val)} disabled={item.id === user?.id}>
                          <SelectTrigger className="w-[140px] h-8 text-xs font-semibold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="attendee">Attendee</SelectItem>
                            <SelectItem value="organiser">Organiser</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge className={`border-none capitalize ${
                          item.is_active
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400'
                        }`}>
                          {item.is_active ? 'Active' : 'Suspended'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleActiveToggle(item.id, item.is_active)}
                          disabled={item.id === user?.id}
                          className="h-8 text-xs font-semibold text-muted-foreground hover:text-foreground"
                        >
                          {item.is_active ? (
                            <span className="text-red-500 hover:text-red-600 flex items-center gap-1"><ToggleRight className="h-4 w-4" /> Suspend</span>
                          ) : (
                            <span className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1"><ToggleLeft className="h-4 w-4" /> Activate</span>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          ) : (
            <EmptyState
              icon={Users}
              title="No users found"
              description="No user matches the filter constraints or the register is empty."
            />
          )}
        </main>
      </div>
      <Footer />
    </div>
  )
}
