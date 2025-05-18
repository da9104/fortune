import { NextResponse } from "next/server"
import sharp from 'sharp'
import path from 'path'
import fs from 'fs'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const imagePath1 = formData.get("image1") as string
    const imagePath2 = formData.get("image2") as string

    // Get birthday information
    const birthDay = formData.get("birthDay") as string
    const birthMonth = formData.get("birthMonth") as string
    const birthYear = formData.get("birthYear") as string

    if (!imagePath1 || !imagePath2) {
      console.error("Missing image paths:", { imagePath1, imagePath2 })
      return NextResponse.json({ error: "No image path provided" }, { status: 400 })
    }

    // Get the absolute path to the public directory
    const publicDir = path.join(process.cwd(), 'public')
    const fullImagePath1 = path.join(publicDir, imagePath1)
    const fullImagePath2 = path.join(publicDir, imagePath2)

    // Check if file exists
    if (!fs.existsSync(fullImagePath1) || !fs.existsSync(fullImagePath2)) {
      console.error("Image files not found:", { fullImagePath1, fullImagePath2 })
      return NextResponse.json({ error: "Image file not found" }, { status: 404 })
    }

    try {
      // Process first image
      const image1 = sharp(fullImagePath1)
      const metadata1 = await image1.metadata()
      const bubbles1 = await detectBubbles(image1, metadata1.width!, metadata1.height!)

      // Process second image
      const image2 = sharp(fullImagePath2)
      const metadata2 = await image2.metadata()
      const bubbles2 = await detectBubbles(image2, metadata2.width!, metadata2.height!)

      // Log successful detection
      console.log("Bubbles detected:", {
        image1: bubbles1.length,
        image2: bubbles2.length,
        birthday: `${birthMonth}/${birthDay}/${birthYear}`
      })

      return NextResponse.json({
        bubbles: {
          image1: bubbles1,
          image2: bubbles2
        },
        birthdayInfo: {
          day: birthDay,
          month: birthMonth,
          year: birthYear,
        },
      })
    } catch (error) {
      console.error("Image processing error:", error)
      return NextResponse.json({ error: "Failed to process images" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}

async function detectBubbles(image: sharp.Sharp, width: number, height: number) {
  try {
    // Convert image to grayscale and get raw pixel data
    const { data } = await image
      .grayscale()
      .raw()
      .toBuffer({ resolveWithObject: true })

    const visited = new Array(width * height).fill(false)
    const bubbles = []

    // Threshold for what we consider "white" (0-255)
    const whiteThreshold = 200

    // Minimum size for a bubble (in pixels)
    const minBubbleSize = 1000

    // Function to check if a pixel is white
    const isWhite = (x: number, y: number) => {
      if (x < 0 || y < 0 || x >= width || y >= height) return false
      const idx = y * width + x
      return data[idx] > whiteThreshold
    }

    // Flood fill algorithm to find connected white regions
    const floodFill = (startX: number, startY: number) => {
      const queue = [{ x: startX, y: startY }]
      const region = []

      while (queue.length > 0) {
        const { x, y } = queue.shift()!
        const idx = y * width + x

        if (visited[idx]) continue

        visited[idx] = true
        region.push({ x, y })

        // Check 4-connected neighbors
        if (isWhite(x + 1, y)) queue.push({ x: x + 1, y })
        if (isWhite(x - 1, y)) queue.push({ x: x - 1, y })
        if (isWhite(x, y + 1)) queue.push({ x, y: y + 1 })
        if (isWhite(x, y - 1)) queue.push({ x, y: y - 1 })
      }

      return region
    }

    // Scan the image for white regions
    for (let y = 0; y < height; y += 10) {
      for (let x = 0; x < width; x += 10) {
        const idx = y * width + x

        if (!visited[idx] && isWhite(x, y)) {
          const region = floodFill(x, y)

          if (region.length > minBubbleSize) {
            // Calculate bounding box
            let minX = width,
              minY = height,
              maxX = 0,
              maxY = 0

            for (const { x, y } of region) {
              minX = Math.min(minX, x)
              minY = Math.min(minY, y)
              maxX = Math.max(maxX, x)
              maxY = Math.max(maxY, y)
            }

            // Add bubble with some padding
            bubbles.push({
              x: Math.max(0, minX - 5),
              y: Math.max(0, minY - 5),
              width: Math.min(width - minX, maxX - minX + 10),
              height: Math.min(height - minY, maxY - minY + 10),
            })
          }
        }
      }
    }

    // For demo purposes, if no bubbles were detected, return a default one
    if (bubbles.length === 0) {
      console.log("No bubbles detected, using default bubble")
      // Look for a bubble in the bottom part of the image
      const bottomY = Math.floor(height * 0.7)
      const bubbleHeight = Math.floor(height * 0.2)
      const bubbleWidth = Math.floor(width * 0.3)

      bubbles.push({
        x: Math.floor(width / 2 - bubbleWidth / 2),
        y: bottomY,
        width: bubbleWidth,
        height: bubbleHeight,
      })
    }

    return bubbles
  } catch (error) {
    console.error("Error in detectBubbles:", error)
    throw error
  }
}

