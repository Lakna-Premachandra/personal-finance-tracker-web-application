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
  Building
} from "lucide-react"
import { useEffect, useState } from "react"
// Update this path to your actual API file
import { ProfileResponse, useCheckAgeTransitionMutation, useDeleteProfileMutation, useGetProfileByIdQuery, useUpdateProfileMutation } from "@/services/controllers/profileController"
import { updateProfilePicture } from "@/store/slices/authSlice"
import { useDispatch } from "react-redux"
import { toast } from "sonner"; // or whatever toast library you're using
import { useCurrency } from "@/hooks/useCurrency"
import { CurrencyCode } from "@/store/slices/currencySlice"

export default function YoungAdultSettingsPage() {
  const [userId, setUserId] = useState(null)
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null)
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
  // Handle profile update
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

      // Only include dateOfBirth for students


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
      const previewURL = URL.createObjectURL(file);
      setProfilePicturePreview(previewURL);
      setProfile((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          profilePicture: file,
        }
      }));
    }
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