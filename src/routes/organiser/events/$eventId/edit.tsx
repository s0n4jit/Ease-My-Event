import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  MapPin, Image as ImageIcon, Save, ArrowLeft, Loader2, AlertCircle
} from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '#/components/ui/select'
import { Navbar } from '#/components/shared/Navbar'
import { Footer } from '#/components/shared/Footer'
import { AuthGuard } from '#/components/auth/AuthGuard'
import { useAuth } from '#/hooks/use-auth'
import { useCategories, useEventById } from '#/hooks/use-events'
import { supabase } from '#/lib/supabase'
import { toast } from 'sonner'
import { PageLoader } from '#/components/shared/LoadingSpinner'

export const Route = createFileRoute('/organiser/events/$eventId/edit')({
  meta: () => [
    { title: 'Edit Event Details | EaseMyEvent' },
    { name: 'robots', content: 'noindex, nofollow' }
  ],
  component: () => (
    <AuthGuard allowedRoles={['organiser', 'admin']}>
      <EditEventPage />
    </AuthGuard>
  ),
})

function EditEventPage() {
  const { eventId } = Route.useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: categories } = useCategories()
  const { data: eventData, isLoading: loadingEvent } = useEventById(eventId)
  const event = eventData as any

  // Form State
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [eventType, setEventType] = useState<'offline' | 'online' | 'hybrid'>('offline')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [capacity, setCapacity] = useState('')
  const [venueName, setVenueName] = useState('')
  const [venueAddress, setVenueAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [country, setCountry] = useState('India')
  const [onlineUrl, setOnlineUrl] = useState('')
  const [bannerUrl, setBannerUrl] = useState('')
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [status, setStatus] = useState<'draft' | 'published' | 'cancelled'>('draft')

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sync loaded event with state
  useEffect(() => {
    if (event) {
      setTitle(event.title || '')
      setCategoryId(event.category_id || '')
      setDescription(event.description || '')
      setEventType(event.event_type || 'offline')
      
      // format dates to YYYY-MM-DDThh:mm for datetime-local
      if (event.start_date) {
        const d = new Date(event.start_date)
        const offset = d.getTimezoneOffset()
        const local = new Date(d.getTime() - offset * 60 * 1000)
        setStartDate(local.toISOString().slice(0, 16))
      }
      if (event.end_date) {
        const d = new Date(event.end_date)
        const offset = d.getTimezoneOffset()
        const local = new Date(d.getTime() - offset * 60 * 1000)
        setEndDate(local.toISOString().slice(0, 16))
      }
      
      setCapacity(event.capacity ? String(event.capacity) : '')
      setVenueName(event.venue_name || '')
      setVenueAddress(event.venue_address || '')
      setCity(event.city || '')
      setState(event.state || '')
      setCountry(event.country || 'India')
      setOnlineUrl(event.online_url || '')
      setBannerUrl(event.banner_url || '')
      setStatus(event.status as any || 'draft')
    }
  }, [event])

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingBanner(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
      const { error } = await supabase.storage
        .from('event-banners')
        .upload(fileName, file, { cacheControl: '3600', upsert: true })

      if (error) throw error

      const { data: publicUrlData } = supabase.storage
        .from('event-banners')
        .getPublicUrl(fileName)

      setBannerUrl(publicUrlData.publicUrl)
      toast.success('Banner uploaded successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploadingBanner(false)
    }
  }

  const handleSave = async () => {
    if (!title || !categoryId || !startDate || !endDate) {
      toast.error('Please fill in all required fields!')
      return
    }
    setIsSubmitting(true)
    try {
      const { error } = await (supabase as any)
        .from('events')
        .update({
          category_id: categoryId || null,
          title,
          description,
          event_type: eventType,
          venue_name: eventType !== 'online' ? venueName : null,
          venue_address: eventType !== 'online' ? venueAddress : null,
          city: eventType !== 'online' ? city : null,
          state: eventType !== 'online' ? state : null,
          country: eventType !== 'online' ? country : null,
          online_url: eventType !== 'offline' ? onlineUrl : null,
          start_date: new Date(startDate).toISOString(),
          end_date: new Date(endDate).toISOString(),
          capacity: capacity ? Number(capacity) : null,
          status,
          banner_url: bannerUrl || null,
        } as any)
        .eq('id', eventId)

      if (error) throw error

      toast.success('Event updated successfully!')
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['events', 'by-id', eventId] })
      navigate({ to: '/organiser/events' })
    } catch (err: any) {
      toast.error(err.message || 'Failed to update event')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loadingEvent) return <><Navbar /><PageLoader /><Footer /></>

  if (!event || (event.organiser_id !== user?.id && user?.role !== 'admin')) {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <Navbar />
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground mt-2">You do not have permission to edit this event.</p>
          <Link to="/organiser/events" className="mt-6 no-underline inline-block">
            <Button>Back to Events</Button>
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
      <div>
        <Navbar />
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center gap-4">
            <Link to="/organiser/events" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">Edit Event Details</h1>
              <p className="text-muted-foreground text-sm mt-1">Modify event specifications, dates, capacity, or publishing state</p>
            </div>
          </div>

          <Card className="border-border/50 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Event Specifications</CardTitle>
              <CardDescription>All changes will be reflected instantly upon saving.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label className="font-semibold text-xs text-foreground/80">Event Title *</Label>
                  <Input placeholder="Event Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="font-semibold text-xs text-foreground/80">Category *</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="font-semibold text-xs text-foreground/80">Start Date & Time *</Label>
                  <Input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="font-semibold text-xs text-foreground/80">End Date & Time *</Label>
                  <Input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="font-semibold text-xs text-foreground/80">Event Type *</Label>
                  <Select value={eventType} onValueChange={(val: any) => setEventType(val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Event Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="offline">Offline / In-person</SelectItem>
                      <SelectItem value="online">Online / Virtual</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="font-semibold text-xs text-foreground/80">Capacity (Optional)</Label>
                  <Input type="number" placeholder="eg: 150" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label className="font-semibold text-xs text-foreground/80">Status</Label>
                  <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Location Fields */}
              <div className="pt-4 border-t border-border/50">
                <h3 className="font-bold text-sm text-violet-600 mb-4 flex items-center gap-1.5"><MapPin className="h-4 w-4" /> Location & Links</h3>
                {eventType === 'online' ? (
                  <div className="flex flex-col gap-2">
                    <Label className="font-semibold text-xs text-foreground/80">Virtual Meeting URL *</Label>
                    <Input placeholder="Zoom, Youtube Stream URL" value={onlineUrl} onChange={(e) => setOnlineUrl(e.target.value)} />
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label className="font-semibold text-xs text-foreground/80">Venue / Building Name *</Label>
                      <Input placeholder="Taj Convention Center" value={venueName} onChange={(e) => setVenueName(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="font-semibold text-xs text-foreground/80">Street Address</Label>
                      <Input placeholder="Street Address" value={venueAddress} onChange={(e) => setVenueAddress(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="font-semibold text-xs text-foreground/80">City *</Label>
                      <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="font-semibold text-xs text-foreground/80">State / Region</Label>
                      <Input placeholder="State" value={state} onChange={(e) => setState(e.target.value)} />
                    </div>
                  </div>
                )}
              </div>

              {/* Banner Upload */}
              <div className="pt-4 border-t border-border/50">
                <h3 className="font-bold text-sm text-violet-600 mb-4 flex items-center gap-1.5"><ImageIcon className="h-4 w-4" /> Media & Images</h3>
                <div className="flex items-center gap-4">
                  <Input type="file" accept="image/*" className="hidden" id="edit-banner-input" onChange={handleBannerUpload} disabled={uploadingBanner} />
                  <Label htmlFor="edit-banner-input">
                    <Button asChild variant="outline" size="sm" className="cursor-pointer">
                      <span>{uploadingBanner ? 'Uploading...' : 'Change Banner Image'}</span>
                    </Button>
                  </Label>
                </div>
                {bannerUrl && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-border/50 max-h-56 max-w-md">
                    <img src={bannerUrl} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-border/50">
                <Label className="font-semibold text-xs text-foreground/80">Event Description</Label>
                <Textarea placeholder="Event Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={6} className="mt-1" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t border-border/50 p-4 bg-slate-50/50 dark:bg-slate-900/20">
              <Link to="/organiser/events" className="no-underline">
                <Button variant="ghost" size="sm">Cancel</Button>
              </Link>
              <Button onClick={handleSave} disabled={isSubmitting} className="bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs gap-1.5 h-9">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Changes
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
      <Footer />
    </div>
  )
}
