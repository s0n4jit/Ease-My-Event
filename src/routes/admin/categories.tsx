import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowLeft, Plus, Edit3, Trash2, ShieldAlert, FolderKanban, Save, Tag, X } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Card } from '#/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '#/components/ui/table'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { Navbar } from '#/components/shared/Navbar'
import { Footer } from '#/components/shared/Footer'
import { EmptyState } from '#/components/shared/EmptyState'
import { PageLoader } from '#/components/shared/LoadingSpinner'
import { AuthGuard } from '#/components/auth/AuthGuard'
import { useAuth } from '#/hooks/use-auth'
import { useCategories } from '#/hooks/use-events'
import { useManageCategories } from '#/hooks/use-admin'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '#/components/ui/dialog'
import { toast } from 'sonner'

export const Route = createFileRoute('/admin/categories')({
  meta: () => [
    { title: 'Category Management | EaseMyEvent' },
    { name: 'robots', content: 'noindex, nofollow' }
  ],
  component: () => (
    <AuthGuard allowedRoles={['admin']}>
      <AdminCategoriesPage />
    </AuthGuard>
  ),
})

function AdminCategoriesPage() {
  const { user } = useAuth()
  const { data: categories, isLoading, refetch } = useCategories()
  const { createCategory, updateCategory, removeCategory } = useManageCategories()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any | null>(null)
  
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('tag')

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

  const handleOpenCreate = () => {
    setEditingCategory(null)
    setName('')
    setSlug('')
    setDescription('')
    setIcon('tag')
    setDialogOpen(true)
  }

  const handleOpenEdit = (cat: any) => {
    setEditingCategory(cat)
    setName(cat.name || '')
    setSlug(cat.slug || '')
    setDescription(cat.description || '')
    setIcon(cat.icon || 'tag')
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!name || !slug) {
      toast.error('Name and Slug are required!')
      return
    }
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({
          id: editingCategory.id,
          updates: { name, slug, description, icon }
        })
        toast.success('Category updated successfully!')
      } else {
        await createCategory.mutateAsync({ name, slug, description, icon })
        toast.success('Category created successfully!')
      }
      setDialogOpen(false)
      refetch()
    } catch (err: any) {
      toast.error(err.message || 'Failed to save category')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? Events linked to it will be uncategorized.')) return
    try {
      await removeCategory.mutateAsync(id)
      toast.success('Category deleted successfully!')
      refetch()
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete category')
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
                <h1 className="text-2xl font-bold sm:text-3xl">Manage Categories</h1>
                <p className="text-muted-foreground text-sm mt-1">Audit, modify, or add public interest classifications and navigation tags</p>
              </div>
            </div>
            <Button onClick={handleOpenCreate} className="bg-violet-600 hover:bg-violet-700 text-white gap-1.5 h-10">
              <Plus className="h-4 w-4" /> Add Category
            </Button>
          </div>

          {categories && categories.length > 0 ? (
            <Card className="border-border/50 shadow-sm overflow-hidden bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category Info</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Icon Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((cat: any) => (
                    <TableRow key={cat.id}>
                      <TableCell className="font-semibold text-xs text-foreground/90 flex items-center gap-2">
                        <Tag className="h-4 w-4 text-violet-500 shrink-0" />
                        {cat.name}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{cat.slug}</TableCell>
                      <TableCell className="text-xs max-w-xs truncate text-muted-foreground">{cat.description || '—'}</TableCell>
                      <TableCell className="font-mono text-[10px] text-muted-foreground">{cat.icon}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-blue-600" onClick={() => handleOpenEdit(cat)}>
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-rose-600" onClick={() => handleDelete(cat.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          ) : (
            <EmptyState
              icon={FolderKanban}
              title="No categories"
              description="Create default categories to categorize events and optimize user recommendations"
              action={<Button onClick={handleOpenCreate}>Create Category</Button>}
            />
          )}
        </main>
      </div>
      <Footer />

      {/* Category Editor Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Create Category'}</DialogTitle>
            <DialogDescription>
              Assign classification attributes for global listings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Category Name *</label>
              <Input
                placeholder="eg: Arts & Music"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (!editingCategory) {
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
                  }
                }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Slug *</label>
              <Input placeholder="eg: arts-music" value={slug} onChange={(e) => setSlug(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Icon Identifier</label>
              <Input placeholder="eg: music, tag, briefcase" value={icon} onChange={(e) => setIcon(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Description</label>
              <Textarea placeholder="Short tag overview..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              <X className="mr-1 h-4 w-4" /> Cancel
            </Button>
            <Button onClick={handleSave} className="bg-violet-600 hover:bg-violet-700 text-white font-bold h-9">
              <Save className="mr-1 h-4 w-4" /> Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
