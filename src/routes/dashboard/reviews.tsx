import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Edit, Trash2, Calendar, MessageSquare, Save, X } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader } from '#/components/ui/card'
import { Navbar } from '#/components/shared/Navbar'
import { Footer } from '#/components/shared/Footer'
import { EmptyState } from '#/components/shared/EmptyState'
import { PageLoader } from '#/components/shared/LoadingSpinner'
import { AuthGuard } from '#/components/auth/AuthGuard'
import { useAuth } from '#/hooks/use-auth'
import { useMyReviews, useUpdateReview, useDeleteReview } from '#/hooks/use-reviews'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '#/components/ui/dialog'
import { Textarea } from '#/components/ui/textarea'
import { toast } from 'sonner'
import { format } from 'date-fns'

export const Route = createFileRoute('/dashboard/reviews')({
  meta: () => [
    { title: 'My Reviews | EaseMyEvent' },
    { name: 'robots', content: 'noindex, nofollow' }
  ],
  component: () => (
    <AuthGuard>
      <MyReviewsPage />
    </AuthGuard>
  ),
})

function MyReviewsPage() {
  const { user } = useAuth()
  const { data: reviews, isLoading } = useMyReviews(user?.id)
  const updateReview = useUpdateReview()
  const deleteReview = useDeleteReview()

  const [editingReview, setEditingReview] = useState<any | null>(null)
  const [editRating, setEditRating] = useState(5)
  const [editComment, setEditComment] = useState('')

  if (isLoading) return <><Navbar /><PageLoader /><Footer /></>

  const handleEditOpen = (review: any) => {
    setEditingReview(review)
    setEditRating(review.rating)
    setEditComment(review.comment || '')
  }

  const handleSave = async () => {
    if (!editingReview) return
    try {
      await updateReview.mutateAsync({
        id: editingReview.id,
        updates: { rating: editRating, comment: editComment },
      })
      toast.success('Review updated successfully!')
      setEditingReview(null)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update review')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return
    try {
      await deleteReview.mutateAsync(id)
      toast.success('Review deleted successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete review')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
      <div>
        <Navbar />
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <h1 className="text-2xl font-bold sm:text-3xl">My Reviews</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage and edit your feedback for completed events</p>
          </motion.div>

          {reviews && reviews.length > 0 ? (
            <div className="grid gap-6">
              {reviews.map((review: any) => (
                <motion.div key={review.id} layout>
                  <Card className="border-border/50 hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                      <div>
                        <Link to="/events/$slug" params={{ slug: review.event?.slug || '' }} className="font-semibold text-lg hover:text-violet-600 transition-colors no-underline">
                          {review.event?.title || 'Unknown Event'}
                        </Link>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          Reviewed on {format(new Date(review.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-violet-600" onClick={() => handleEditOpen(review)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-600" onClick={() => handleDelete(review.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                        ))}
                      </div>
                      <p className="text-sm text-foreground/90 whitespace-pre-line">{review.comment || 'No comment provided.'}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={MessageSquare}
              title="No reviews yet"
              description="Events you attend will show up here once you review them"
              action={<Link to="/events"><Button>Browse Events</Button></Link>}
            />
          )}
        </main>
      </div>
      <Footer />

      {/* Edit Review Dialog */}
      <Dialog open={!!editingReview} onOpenChange={(open) => !open && setEditingReview(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Your Review</DialogTitle>
            <DialogDescription>
              Update your rating and comment for {editingReview?.event?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Rating</label>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    onClick={() => setEditRating(i + 1)}
                  >
                    <Star className={`h-8 w-8 ${i < editRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Review Comment</label>
              <Textarea
                placeholder="Share your experience..."
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setEditingReview(null)}>
              <X className="mr-1 h-4 w-4" /> Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateReview.isPending} className="bg-violet-600 hover:bg-violet-700 text-white">
              <Save className="mr-1 h-4 w-4" /> {updateReview.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
