export const getLocation = async (lat, lon) => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`

    try {
        const res = await fetch(url, {
            headers: {"User-Agent": "Crowdsourced Civic Issues Reporting App"}
        })

        if (!res.ok) throw new Error("Failed to fetch location data")

        const data = await res.json()
        const address = data.address || {}

        let state = address.state || state.region || null
        let district = address.state_district || address.state || null

        if (!state) {
            state = address.city
            district = address.city
        }

        // console.log(state)
        // console.log(district)
        return {state, district}
    } catch (err) {
        console.log(err)
        return {state: null, district: null}
    }
}

export const uploadImageToCloudinary = async (file) => {
  if (!file.type.startsWith("image/")) throw new Error("Only image files are allowed")

  const MAX_SIZE = 5 * 1024 * 1024
  if (file.size > MAX_SIZE) throw new Error("File size exceeds 5MB limit")

  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", "ccira_upload_preset")

  try {
    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dfombot2h/image/upload",
      {
        method: "POST",
        body: formData
      }
    );

    if (!res.ok) throw new Error("Image upload failed")

    const data = await res.json()

    return data.secure_url
  } catch (err) {
    console.error("Cloudinary upload error:", err)
    throw err
  }
};