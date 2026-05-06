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

const isRealImage = async (file) => {
  const buffer = await file.slice(0, 4).arrayBuffer()
  const bytes = new Uint8Array(buffer)
  const isJpeg = bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF
  const isPng  = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47
  const isWebp = bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46
  return isJpeg || isPng || isWebp
}

export const uploadImageToCloudinary = async (file) => {
  if (!file.type.startsWith("image/")) throw new Error("Only image files are allowed")

  const MAX_SIZE = 5 * 1024 * 1024
  if (file.size > MAX_SIZE) throw new Error("File size exceeds 5MB limit")

  if (!(await isRealImage(file))) throw new Error("File does not appear to be a valid image")

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