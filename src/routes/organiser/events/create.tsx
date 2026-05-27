import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, MapPin, Image as ImageIcon, Users, Ticket, Check, ChevronRight, ChevronLeft,
  Wand2, Sparkles, Loader2, Plus, Trash2, Globe, Laptop
} from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardFooter } from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '#/components/ui/select'
import { Navbar } from '#/components/shared/Navbar'
import { Footer } from '#/components/shared/Footer'
import { AuthGuard } from '#/components/auth/AuthGuard'

import { useAuth } from '#/hooks/use-auth'
import { useCategories } from '#/hooks/use-events'
import { supabase } from '#/lib/supabase'
import { toast } from 'sonner'
import { generateEventDescription } from '#/server/gemini'

export const Route = createFileRoute('/organiser/events/create')({
  meta: () => [
    { title: 'Create Event | EaseMyEvent' },
    { name: 'robots', content: 'noindex, nofollow' }
  ],
  component: () => (
    <AuthGuard allowedRoles={['organiser', 'admin']}>
      <CreateEventWizardPage />
    </AuthGuard>
  ),
})

const STEPS = [
  { id: 'basics', name: 'Basics', icon: Calendar },
  { id: 'location', name: 'Location', icon: MapPin },
  { id: 'media', name: 'Media', icon: ImageIcon },
  { id: 'speakers', name: 'Speakers', icon: Users },
  { id: 'tickets', name: 'Tickets', icon: Ticket },
  { id: 'publish', name: 'Publish', icon: Check },
]

function CreateEventWizardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: categories } = useCategories()
  const [currentStep, setCurrentStep] = useState(0)

  // Form State
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [eventType, setEventType] = useState<'offline' | 'online' | 'hybrid'>('offline')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [capacity, setCapacity] = useState('')

  // AI assistant state
  const [aiPrompt, setAiPrompt] = useState('')
  const [generatingAi, setGeneratingAi] = useState(false)

  // Location details
  const [venueName, setVenueName] = useState('')
  const [venueAddress, setVenueAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const country = 'India'
  const [onlineUrl, setOnlineUrl] = useState('')

  // Media
  const [bannerUrl, setBannerUrl] = useState('')
  const [uploadingBanner, setUploadingBanner] = useState(false)

  // Speakers
  const [speakers, setSpeakers] = useState<Array<{ name: string; title: string; bio: string; linkedin_url: string }>>([])
  const [newSpeakerName, setNewSpeakerName] = useState('')
  const [newSpeakerTitle, setNewSpeakerTitle] = useState('')
  const [newSpeakerBio, setNewSpeakerBio] = useState('')
  const [newSpeakerLinkedin, setNewSpeakerLinkedin] = useState('')

  // Tickets
  const [ticketTypes, setTicketTypes] = useState<Array<{ name: string; description: string; price: number; quantity: number }>>([
    { name: 'General Admission', description: 'Standard entry ticket', price: 0, quantity: 100 }
  ])
  const [newTicketName, setNewTicketName] = useState('')
  const [newTicketDesc, setNewTicketDesc] = useState('')
  const [newTicketPrice, setNewTicketPrice] = useState('')
  const [newTicketQty, setNewTicketQty] = useState('')

  // Submitting
  const [isSubmitting, setIsSubmitting] = useState(false)

  const nextStep = () => {
    if (currentStep === 0 && (!title || !categoryId || !startDate || !endDate)) {
      toast.error('Please fill in all required fields!')
      return
    }
    if (currentStep === 1 && eventType === 'offline' && (!venueName || !city)) {
      toast.error('Please fill in venue name and city!')
      return
    }
    if (currentStep === 1 && eventType === 'online' && !onlineUrl) {
      toast.error('Please provide the event URL!')
      return
    }
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1))
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const handleGenerateAI = async () => {
    if (!aiPrompt) {
      toast.warning('Please enter some bullet points or short prompts first!')
      return
    }
    setGeneratingAi(true)
    try {
      const res = await generateEventDescription({
        data: {
          bullet_points: aiPrompt,
          event_title: title,
          event_type: eventType,
        }
      })
      if (res?.generated_text) {
        setDescription(res.generated_text)
        toast.success('AI description generated successfully!')
      }
    } catch (err: any) {
      toast.error(err.message || 'AI generation failed')
    } finally {
      setGeneratingAi(false)
    }
  }

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

  const handleAddSpeaker = () => {
    if (!newSpeakerName) {
      toast.error('Speaker name is required!')
      return
    }
    setSpeakers([...speakers, {
      name: newSpeakerName,
      title: newSpeakerTitle,
      bio: newSpeakerBio,
      linkedin_url: newSpeakerLinkedin
    }])
    setNewSpeakerName('')
    setNewSpeakerTitle('')
    setNewSpeakerBio('')
    setNewSpeakerLinkedin('')
    toast.success('Speaker added!')
  }

  const handleRemoveSpeaker = (index: number) => {
    setSpeakers(speakers.filter((_, i) => i !== index))
  }

  const handleAddTicket = () => {
    if (!newTicketName || !newTicketQty) {
      toast.error('Ticket name and quantity are required!')
      return
    }
    setTicketTypes([...ticketTypes, {
      name: newTicketName,
      description: newTicketDesc,
      price: Number(newTicketPrice) || 0,
      quantity: Number(newTicketQty) || 0
    }])
    setNewTicketName('')
    setNewTicketDesc('')
    setNewTicketPrice('')
    setNewTicketQty('')
    toast.success('Ticket tier added!')
  }

  const handleRemoveTicket = (index: number) => {
    setTicketTypes(ticketTypes.filter((_, i) => i !== index))
  }

  const handlePublish = async (status: 'published' | 'draft') => {
    setIsSubmitting(true)
    try {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.floor(Math.random() * 1000)
      
      const { data: eventData, error: eventError } = (await supabase
        .from('events')
        .insert({
          organiser_id: user!.id,
          category_id: categoryId || null,
          title,
          slug,
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
          capacity: Number(capacity) || null,
          status,
          banner_url: bannerUrl || null,
        } as any)
        .select()
        .single()) as any

      if (eventError) throw eventError

      // Insert Speakers
      if (speakers.length > 0) {
        const { error: speakersError } = await supabase
          .from('speakers')
          .insert(speakers.map((s, i) => ({
            event_id: eventData.id,
            name: s.name,
            title: s.title,
            bio: s.bio,
            linkedin_url: s.linkedin_url,
            sort_order: i
          })) as any)
        if (speakersError) throw speakersError
      }

      // Insert Ticket Types
      if (ticketTypes.length > 0) {
        const { error: ticketsError } = await supabase
          .from('ticket_types')
          .insert(ticketTypes.map((t, i) => ({
            event_id: eventData.id,
            name: t.name,
            description: t.description,
            price: t.price,
            quantity: t.quantity,
            sort_order: i
          })) as any)
        if (ticketsError) throw ticketsError
      }

      toast.success(`Event ${status === 'published' ? 'published' : 'saved as draft'} successfully!`)
      navigate({ to: '/organiser/events' })
    } catch (err: any) {
      toast.error(err.message || 'Failed to create event')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
      <div>
        <Navbar />
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 text-center sm:text-left">
            <h1 className="text-2xl font-bold sm:text-3xl">Create New Event</h1>
            <p className="text-muted-foreground text-sm mt-1">Design an experience, setup ticket tiers, and list your event details</p>
          </div>

          {/* Stepper bar */}
          <div className="mb-8 border-b border-border/50 pb-4">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {STEPS.map((step, index) => {
                const IconComponent = step.icon
                const isActive = currentStep === index
                const isCompleted = currentStep > index

                return (
                  <div key={step.id} className="flex flex-col items-center gap-1.5 shrink-0 relative">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center border text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-violet-600 border-violet-600 text-white shadow-md scale-110 shadow-violet-600/20'
                        : isCompleted
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'bg-card border-border/50 text-muted-foreground'
                    }`}>
                      {isCompleted ? <Check className="h-4 w-4" /> : <IconComponent className="h-4 w-4" />}
                    </div>
                    <span className={`text-[10px] font-semibold tracking-wider uppercase transition-colors ${
                      isActive ? 'text-violet-600' : isCompleted ? 'text-emerald-500' : 'text-muted-foreground'
                    }`}>
                      {step.name}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Form Wizard Steps */}
          <Card className="border-border/50 shadow-md">
            <CardContent className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Step 1: Basics */}
                  {currentStep === 0 && (
                    <div className="space-y-6">
                      <h3 className="text-base font-bold pb-2 border-b border-border/50 flex items-center gap-2 text-violet-600">
                        <Sparkles className="h-5 w-5" /> Basic Details
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-2">
                          <Label className="font-semibold text-xs text-foreground/80">Event Title *</Label>
                          <Input placeholder="eg: EaseMyEvent Hackathon 2026" value={title} onChange={(e) => setTitle(e.target.value)} />
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
                          <Input type="number" placeholder="eg: 250 (leave empty for unlimited)" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
                        </div>
                      </div>

                      {/* Description with AI generation support */}
                      <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border/50">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-1">
                          <Label className="font-semibold text-xs text-foreground/80">Event Description</Label>
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Input
                              placeholder="Describe your event in bullet points..."
                              value={aiPrompt}
                              onChange={(e) => setAiPrompt(e.target.value)}
                              className="h-8 text-xs max-w-xs shrink"
                            />
                            <Button
                              type="button"
                              onClick={handleGenerateAI}
                              disabled={generatingAi}
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs font-semibold gap-1 text-violet-600 hover:text-white hover:bg-violet-600"
                            >
                              {generatingAi ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
                              AI Generate
                            </Button>
                          </div>
                        </div>
                        <Textarea
                          placeholder="Provide a comprehensive event description..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={6}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 2: Location */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <h3 className="text-base font-bold pb-2 border-b border-border/50 flex items-center gap-2 text-violet-600">
                        <MapPin className="h-5 w-5" /> Location & Venue Details
                      </h3>
                      {eventType === 'online' ? (
                        <div className="flex flex-col gap-2">
                          <Label className="font-semibold text-xs text-foreground/80 flex items-center gap-1.5"><Laptop className="h-4 w-4" /> Broadcast / Virtual Meeting URL *</Label>
                          <Input placeholder="eg: Zoom link, Youtube Stream URL" value={onlineUrl} onChange={(e) => setOnlineUrl(e.target.value)} />
                        </div>
                      ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="flex flex-col gap-2">
                            <Label className="font-semibold text-xs text-foreground/80 flex items-center gap-1.5"><Globe className="h-4 w-4" /> Venue / Building Name *</Label>
                            <Input placeholder="eg: Taj Convention Center" value={venueName} onChange={(e) => setVenueName(e.target.value)} />
                          </div>
                          <div className="flex flex-col gap-2">
                            <Label className="font-semibold text-xs text-foreground/80">Street Address</Label>
                            <Input placeholder="eg: Sector-15, Main Ring Rd" value={venueAddress} onChange={(e) => setVenueAddress(e.target.value)} />
                          </div>
                          <div className="flex flex-col gap-2">
                            <Label className="font-semibold text-xs text-foreground/80">City *</Label>
                            <Input placeholder="eg: Bengaluru" value={city} onChange={(e) => setCity(e.target.value)} />
                          </div>
                          <div className="flex flex-col gap-2">
                            <Label className="font-semibold text-xs text-foreground/80">State / Region</Label>
                            <Input placeholder="eg: Karnataka" value={state} onChange={(e) => setState(e.target.value)} />
                          </div>
                          {eventType === 'hybrid' && (
                            <div className="sm:col-span-2 flex flex-col gap-2 pt-4 border-t border-border/50">
                              <Label className="font-semibold text-xs text-foreground/80 flex items-center gap-1.5"><Laptop className="h-4 w-4" /> Online URL (Hybrid Stream link)</Label>
                              <Input placeholder="eg: Stream URL" value={onlineUrl} onChange={(e) => setOnlineUrl(e.target.value)} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 3: Media */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <h3 className="text-base font-bold pb-2 border-b border-border/50 flex items-center gap-2 text-violet-600">
                        <ImageIcon className="h-5 w-5" /> Media Upload
                      </h3>
                      <div className="flex flex-col items-center justify-center border border-dashed border-border/60 rounded-xl p-8 bg-slate-50 dark:bg-slate-900 text-center">
                        <ImageIcon className="h-10 w-10 text-violet-400 mb-3" />
                        <h4 className="font-bold text-sm">Upload Event Banner</h4>
                        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                          Upload high resolution banner images (16:9 ratio recommended). Max size 5MB.
                        </p>
                        <div className="mt-4">
                          <Input type="file" accept="image/*" className="hidden" id="banner-input" onChange={handleBannerUpload} disabled={uploadingBanner} />
                          <Label htmlFor="banner-input">
                            <Button asChild variant="outline" size="sm" className="cursor-pointer">
                              <span>{uploadingBanner ? 'Uploading...' : 'Choose File'}</span>
                            </Button>
                          </Label>
                        </div>
                      </div>

                      {bannerUrl && (
                        <div className="mt-4 rounded-xl overflow-hidden border border-border/50 max-h-56">
                          <img src={bannerUrl} alt="Preview" className="h-full w-full object-cover" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 4: Speakers */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <h3 className="text-base font-bold pb-2 border-b border-border/50 flex items-center gap-2 text-violet-600">
                        <Users className="h-5 w-5" /> Add Speakers & Hosts
                      </h3>
                      <div className="grid gap-3 p-4 rounded-xl border border-border/50 bg-slate-50/50 dark:bg-slate-900/20">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="flex flex-col gap-1.5">
                            <Label className="text-xs font-semibold">Name</Label>
                            <Input placeholder="eg: Jane Doe" value={newSpeakerName} onChange={(e) => setNewSpeakerName(e.target.value)} />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Label className="text-xs font-semibold">Designation / Title</Label>
                            <Input placeholder="eg: Senior Dev Advocate at Google" value={newSpeakerTitle} onChange={(e) => setNewSpeakerTitle(e.target.value)} />
                          </div>
                          <div className="flex flex-col gap-1.5 sm:col-span-2">
                            <Label className="text-xs font-semibold">Bio</Label>
                            <Textarea placeholder="Short description about the speaker..." value={newSpeakerBio} onChange={(e) => setNewSpeakerBio(e.target.value)} rows={2} />
                          </div>
                          <div className="flex flex-col gap-1.5 sm:col-span-2">
                            <Label className="text-xs font-semibold">LinkedIn URL</Label>
                            <Input placeholder="eg: https://linkedin.com/in/username" value={newSpeakerLinkedin} onChange={(e) => setNewSpeakerLinkedin(e.target.value)} />
                          </div>
                        </div>
                        <Button type="button" onClick={handleAddSpeaker} className="mt-2 bg-violet-600 hover:bg-violet-700 text-white self-end text-xs h-8">
                          <Plus className="h-4 w-4 mr-1" /> Add Speaker
                        </Button>
                      </div>

                      {speakers.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Added Speakers</h4>
                          {speakers.map((speaker, index) => (
                            <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                              <div>
                                <p className="font-semibold text-xs">{speaker.name}</p>
                                <p className="text-[10px] text-muted-foreground">{speaker.title}</p>
                              </div>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-500 hover:text-rose-600" onClick={() => handleRemoveSpeaker(index)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 5: Tickets */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <h3 className="text-base font-bold pb-2 border-b border-border/50 flex items-center gap-2 text-violet-600">
                        <Ticket className="h-5 w-5" /> Ticket Tiers
                      </h3>
                      <div className="grid gap-3 p-4 rounded-xl border border-border/50 bg-slate-50/50 dark:bg-slate-900/20">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="flex flex-col gap-1.5">
                            <Label className="text-xs font-semibold">Tier Name</Label>
                            <Input placeholder="eg: Early Bird, VIP Access" value={newTicketName} onChange={(e) => setNewTicketName(e.target.value)} />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Label className="text-xs font-semibold">Quantity / Cap</Label>
                            <Input type="number" placeholder="eg: 50" value={newTicketQty} onChange={(e) => setNewTicketQty(e.target.value)} />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Label className="text-xs font-semibold">Price (₹, set 0 for Free)</Label>
                            <Input type="number" placeholder="eg: 499" value={newTicketPrice} onChange={(e) => setNewTicketPrice(e.target.value)} />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Label className="text-xs font-semibold">Description</Label>
                            <Input placeholder="eg: Standard pass features" value={newTicketDesc} onChange={(e) => setNewTicketDesc(e.target.value)} />
                          </div>
                        </div>
                        <Button type="button" onClick={handleAddTicket} className="mt-2 bg-violet-600 hover:bg-violet-700 text-white self-end text-xs h-8">
                          <Plus className="h-4 w-4 mr-1" /> Add Ticket Tier
                        </Button>
                      </div>

                      <div className="mt-4 space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Configured Tiers</h4>
                        {ticketTypes.map((ticket, index) => (
                          <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                            <div>
                              <p className="font-semibold text-xs">{ticket.name} (Qty: {ticket.quantity})</p>
                              <p className="text-[10px] text-muted-foreground">{ticket.description || 'No description provided'}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-xs text-violet-600">{ticket.price === 0 ? 'Free' : `₹${ticket.price}`}</span>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-500 hover:text-rose-600" onClick={() => handleRemoveTicket(index)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 6: Publish */}
                  {currentStep === 5 && (
                    <div className="space-y-6 text-center py-6">
                      <div className="h-12 w-12 rounded-full bg-violet-100 dark:bg-violet-950/40 text-violet-600 flex items-center justify-center mx-auto mb-4 scale-110">
                        <Check className="h-6 w-6" />
                      </div>
                      <h2 className="text-xl font-bold">Review & Publish Event</h2>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        Your event setup is complete. You can either save it as a Draft to review details later, or Publish it instantly to receive registrations!
                      </p>

                      <div className="flex justify-center gap-3 pt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handlePublish('draft')}
                          disabled={isSubmitting}
                          className="h-10 text-xs font-bold"
                        >
                          Save as Draft
                        </Button>
                        <Button
                          type="button"
                          onClick={() => handlePublish('published')}
                          disabled={isSubmitting}
                          className="bg-violet-600 hover:bg-violet-700 text-white h-10 text-xs font-bold"
                        >
                          {isSubmitting ? 'Publishing...' : 'Publish Event'}
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </CardContent>

            <CardFooter className="flex justify-between border-t border-border/50 p-4 bg-slate-50/50 dark:bg-slate-900/20">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="font-semibold text-xs text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>

              {currentStep < STEPS.length - 1 && (
                <Button
                  onClick={nextStep}
                  className="bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs px-4"
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </CardFooter>
          </Card>
        </main>
      </div>
      <Footer />
    </div>
  )
}
