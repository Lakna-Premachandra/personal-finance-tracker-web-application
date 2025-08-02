"use client"
//this is young adult settings page
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calendar,
  Camera,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Trash2,
  User,
  CreditCard,
  Building,
  Crop,
  RotateCw,
  ZoomIn,
  ZoomOut
} from "lucide-react"
import { useEffect, useState, useRef, useCallback } from "react"
// Update this path to your actual API file
import { ProfileResponse, useCheckAgeTransitionMutation, useDeleteProfileMutation, useGetProfileByIdQuery, useUpdateProfileMutation } from "@/services/controllers/profileController"
import { updateProfilePicture } from "@/store/slices/authSlice"
import { useDispatch } from "react-redux"
import { toast } from "sonner"; // or whatever toast library you're using
import { useCurrency } from "@/hooks/useCurrency"
import { CurrencyCode } from "@/store/slices/currencySlice"

// Image Crop Component
interface ImageCropperProps {
  imageSrc: string
  onCrop: (croppedImageBlob: Blob) => void
  onCancel: () => void
  aspectRatio?: number
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  imageSrc,
  onCrop,
  onCancel,
  aspectRatio = 1
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 200, height: 200 })
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    if (imageRef.current) {
      imageRef.current.onload = () => {
        setImageLoaded(true)
        // Center the crop area
        const img = imageRef.current!
        const size = Math.min(img.width, img.height) * 0.8
        setCrop({
          x: (img.width - size) / 2,
          y: (img.height - size) / 2,
          width: size,
          height: size / aspectRatio
        })
      }
    }
  }, [imageSrc, aspectRatio])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if clicking on resize handle (bottom-right corner)
    const handleSize = 10
    if (
      x >= crop.x + crop.width - handleSize &&
      x <= crop.x + crop.width + handleSize &&
      y >= crop.y + crop.height - handleSize &&
      y <= crop.y + crop.height + handleSize
    ) {
      setIsResizing(true)
    } else if (
      x >= crop.x &&
      x <= crop.x + crop.width &&
      y >= crop.y &&
      y <= crop.y + crop.height
    ) {
      setIsDragging(true)
      setDragStart({ x: x - crop.x, y: y - crop.y })
    }
  }, [crop])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current || !imageRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (isDragging) {
      const newX = Math.max(0, Math.min(x - dragStart.x, imageRef.current.width - crop.width))
      const newY = Math.max(0, Math.min(y - dragStart.y, imageRef.current.height - crop.height))
      setCrop(prev => ({ ...prev, x: newX, y: newY }))
    } else if (isResizing) {
      const newWidth = Math.max(50, Math.min(x - crop.x, imageRef.current.width - crop.x))
      const newHeight = aspectRatio ? newWidth / aspectRatio : Math.max(50, Math.min(y - crop.y, imageRef.current.height - crop.y))
      setCrop(prev => ({ ...prev, width: newWidth, height: newHeight }))
    }
  }, [isDragging, isResizing, dragStart, crop, aspectRatio])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setIsResizing(false)
  }, [])

  const drawCanvas = useCallback(() => {
    if (!canvasRef.current || !imageRef.current || !imageLoaded) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = imageRef.current

    // Set canvas size to match image
    canvas.width = img.width
    canvas.height = img.height

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Save context for transformations
    ctx.save()

    // Apply transformations
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.scale(scale, scale)
    ctx.translate(-canvas.width / 2, -canvas.height / 2)

    // Draw image
    ctx.drawImage(img, 0, 0, img.width, img.height)

    // Restore context
    ctx.restore()

    // Draw crop overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw the actual image in the crop area (not clearing it)
    ctx.save()
    ctx.globalCompositeOperation = 'source-over'
    ctx.drawImage(img, crop.x, crop.y, crop.width, crop.height, crop.x, crop.y, crop.width, crop.height)
    ctx.restore()

    // Draw crop border
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 2
    ctx.strokeRect(crop.x, crop.y, crop.width, crop.height)

    // Draw resize handle
    ctx.fillStyle = '#3b82f6'
    ctx.fillRect(crop.x + crop.width - 5, crop.y + crop.height - 5, 10, 10)

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.lineWidth = 1
    const gridX = crop.width / 3
    const gridY = crop.height / 3

    for (let i = 1; i < 3; i++) {
      ctx.beginPath()
      ctx.moveTo(crop.x + i * gridX, crop.y)
      ctx.lineTo(crop.x + i * gridX, crop.y + crop.height)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(crop.x, crop.y + i * gridY)
      ctx.lineTo(crop.x + crop.width, crop.y + i * gridY)
      ctx.stroke()
    }
  }, [crop, scale, rotation, imageLoaded])

  useEffect(() => {
    drawCanvas()
  }, [drawCanvas])

  const handleCrop = async () => {
    if (!canvasRef.current || !imageRef.current) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = crop.width
    canvas.height = crop.height

    ctx.drawImage(
      imageRef.current,
      crop.x, crop.y, crop.width, crop.height,
      0, 0, crop.width, crop.height
    )

    canvas.toBlob((blob) => {
      if (blob) {
        onCrop(blob)
      }
    }, 'image/jpeg', 0.9)
  }

  return (
    <div className="space-y-4">
      <div className="relative border rounded-lg overflow-hidden bg-gray-100">
        <img
          ref={imageRef}
          src={imageSrc}
          alt="Crop preview"
          className="hidden"
        />
        {imageLoaded && (
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-96 cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setScale(Math.max(0.5, scale - 0.1))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-600 min-w-16 text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setScale(Math.min(3, scale + 0.1))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setRotation((rotation + 90) % 360)}
        >
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleCrop} className="bg-blue-600 hover:bg-blue-700">
          <Crop className="mr-2 h-4 w-4" />
          Crop Image
        </Button>
      </div>
    </div>
  )
}

export default function YoungAdultSettingsPage() {
  const [userId, setUserId] = useState(null)
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null)
  const [showImageCropper, setShowImageCropper] = useState(false)
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [profile, setProfile] = useState<ProfileResponse>({
    success: false,
    data: {
      id: 0,
      username: "",
      email: "",
      dateOfBirth: "",
      address: "",
      age: 0,
      phoneNo: "",
      type: "Young-Adult",
      profilePicture: null,
      guardianContactNo: "",
      employmentStatus: "",
      updatedDate: "",
    }
  })
  // const [currency, setCurrency] = useState("usd")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const { currency, setCurrency, allCurrencies } = useCurrency();

  // Get user ID from session storage or token
  useEffect(() => {
    const token = sessionStorage.getItem('token')
    if (token) {
      try {
        // Decode JWT to get user ID (you might need to adjust this based on your token structure)
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUserId(payload.userId || payload.id || payload.sub)
      } catch (error) {
        console.error('Error decoding token:', error)
        // You might want to redirect to login here
      }
    }
  }, [])

  // RTK Query hooks
  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile
  } = useGetProfileByIdQuery(userId!, {
    skip: !userId
  })

  const dispatch = useDispatch()

  // after successful profile update
  useEffect(() => {
    if (profile.data.profilePicture) {
      if (typeof profile.data.profilePicture === 'string') {
        dispatch(updateProfilePicture(profile.data.profilePicture))
      }
    }
  }, [profile.data.profilePicture, dispatch])

  const [updateProfile, { isLoading: updateLoading }] = useUpdateProfileMutation()
  const [deleteProfile, { isLoading: deleteLoading }] = useDeleteProfileMutation()
  const [checkAgeTransition] = useCheckAgeTransitionMutation()

  // Update local state when profile data is fetched
  useEffect(() => {
    if (profileData?.data) {
      const data = profileData.data
      setProfile({
        success: profileData.success,
        data: {
          id: data.id,
          username: data.username,
          email: data.email,
          dateOfBirth: data.dateOfBirth,
          address: data.address,
          age: data.age,
          phoneNo: data.phoneNo,
          type: data.type,
          profilePicture: data.profilePicture || null,
          guardianContactNo: data.guardianContactNo || "",
          employmentStatus: data.employmentStatus || "",
          updatedDate: data.updatedDate || new Date().toISOString(),
        }
      })
    }
  }, [profileData])

  console.log('Profile Data:', profileData)

  // Handle profile update
  const handleSaveChanges = async () => {
    if (!userId) return

    try {
      // Only check for age transition if user is a student
      if (userType === 'Student') {
        const ageTransitionResult = await checkAgeTransition({
          id: userId,
          data: { dateOfBirth: profile.data.dateOfBirth }
        }).unwrap()

        if (ageTransitionResult.data.requiresTypeChange) {
          toast.info(`Age transition detected: ${ageTransitionResult.data.message}`)
        }
      }

      // Prepare update data - conditionally include dateOfBirth only for students
      const updateData = {
        username: profile.data.username,
        email: profile.data.email,
        address: profile.data.address,
        type: profile.data.type,
        phoneNo: profile.data.phoneNo,
        profilePicture: profile.data.profilePicture,
        guardianContactNo: profile.data.guardianContactNo,
        employmentStatus: profile.data.employmentStatus,
      }

      // Update profile
      const result = await updateProfile({
        id: userId,
        data: updateData
      }).unwrap()

      toast.success(result.message || "Profile updated successfully!")

      if (result.ageTransition) {
        toast.info(`Your age has been updated to ${result.newAge}`)
      }

      // Refetch profile to get updated data
      refetchProfile()
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error("Failed to update profile")
    }
  }

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!userId) return

    try {
      const result = await deleteProfile(userId).unwrap()
      toast.success(result.message || "Account deleted successfully")

      // Clear session and redirect to login
      sessionStorage.removeItem('token')
      // Redirect to login page - adjust route as needed
      window.location.href = '/login'
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error("Failed to delete account")
    }
    setIsDeleteDialogOpen(false)
  }

  // Handle photo upload
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size must be less than 2MB")
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select a valid image file")
        return
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setOriginalImage(result);
        setShowImageCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle cropped image
  const handleCroppedImage = (croppedImageBlob: Blob) => {
    const croppedImageURL = URL.createObjectURL(croppedImageBlob);
    setProfilePicturePreview(croppedImageURL);
    setProfile((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        profilePicture: croppedImageBlob,
      }
    }));
    setShowImageCropper(false);
    toast.success("Image cropped successfully!");
  };

  // Cancel image cropping
  const handleCancelCrop = () => {
    setShowImageCropper(false);
    setOriginalImage(null);
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: any) => {
    if (!dateOfBirth) return 0
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  // Loading state
  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading profile...</span>
      </div>
    )
  }

  // Error state
  if (profileError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading profile</p>
          <Button onClick={refetchProfile}>Retry</Button>
        </div>
      </div>
    )
  }

  const currentAge = calculateAge(profile.data.dateOfBirth)
  const userType = profileData?.data?.type || 'Young-Adult'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      {/* Image Cropper Dialog */}
      <Dialog open={showImageCropper} onOpenChange={setShowImageCropper}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crop Your Profile Picture</DialogTitle>
            <DialogDescription>
              Adjust your image by dragging the crop area and using the controls below.
            </DialogDescription>
          </DialogHeader>
          {originalImage && (
            <ImageCropper
              imageSrc={originalImage}
              onCrop={handleCroppedImage}
              onCancel={handleCancelCrop}
              aspectRatio={1}
            />
          )}
        </DialogContent>
      </Dialog>

      <div className="grid gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your personal information and profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profilePicturePreview || (typeof profile.data.profilePicture === 'string' ? profile.data.profilePicture : "/placehold?height=80&width=80")} />
                <AvatarFallback className="text-lg">
                  {profile.data.username ? profile.data.username.substring(0, 2).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Button variant="outline" size="sm" onClick={() => document.getElementById('photo-upload')?.click()}>
                  <Camera className="mr-2 h-4 w-4" />
                  Change Photo
                </Button>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <p className="text-sm text-muted-foreground">JPG, PNG or GIF. Max size 2MB.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profile.data.username}
                  onChange={(e) => setProfile({ ...profile, data: { ...profile.data, username: e.target.value } })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-10"
                    value={profile.data.email}
                    onChange={(e) => setProfile({ ...profile, data: { ...profile.data, email: e.target.value } })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    className="pl-10"
                    value={profile.data.phoneNo}
                    onChange={(e) => setProfile({ ...profile, data: { ...profile.data, phoneNo: e.target.value } })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="dateOfBirth"
                    type="date"
                    className="pl-10"
                    value={profile.data.dateOfBirth ? new Date(profile.data.dateOfBirth).toISOString().split('T')[0] : ''}
                    onChange={(e) => setProfile({ ...profile, data: { ...profile.data, dateOfBirth: e.target.value } })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="occupation">Occupation</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="occupation"
                    className="pl-10"
                    value={profile.data.employmentStatus}
                    onChange={(e) => setProfile({ ...profile, data: { ...profile.data, employmentStatus: e.target.value } })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="employer">Employer</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="employer"
                    className="pl-10"
                    value={profile.data.employmentStatus}
                    onChange={(e) => setProfile({ ...profile, data: { ...profile.data, employmentStatus: e.target.value } })}
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="address"
                  className="pl-10"
                  value={profile.data.address}
                  onChange={(e) => setProfile({ ...profile, data: { ...profile.data, address: e.target.value } })}
                />
              </div>
            </div>

            {/* Employment Status for Young Adults */}
            <div>
              <Label htmlFor="employment">Employment Status</Label>
              <Select
                value={profile.data.employmentStatus}
                onValueChange={(value) => setProfile({ ...profile, data: { ...profile.data, employmentStatus: value } })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employed">Employed</SelectItem>
                  <SelectItem value="unemployed">Unemployed</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="self-employed">Self-employed</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                {userType} Account
              </Badge>
              <Badge variant="outline">Age: {currentAge}</Badge>
              <Badge variant="outline">Professional</Badge>
            </div>

            <Button
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              onClick={handleSaveChanges}
              disabled={updateLoading}
            >
              {updateLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* App Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              App Preferences
            </CardTitle>
            <CardDescription>Change Currency</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Currency</Label>
                <p className="text-sm text-muted-foreground">Your preferred currency</p>
              </div>
              <Select
                value={currency}
                onValueChange={(value: CurrencyCode) => setCurrency(value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(allCurrencies).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.code} ({config.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Data & Storage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Account Deletion
            </CardTitle>
            <CardDescription>Manage your data and account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-red-600">Delete Account</Label>
                <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
              </div>
              <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Account</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete your account? This action cannot be undone and all your data will
                      be permanently lost.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      disabled={deleteLoading}
                    >
                      {deleteLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Delete Account"
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}