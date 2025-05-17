"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Download, ZoomIn, ZoomOut } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Pre-uploaded comic images
const COMIC_IMAGES = [
  { id: "comic1", name: "Comic 1", path: "/images/comic1.png" },
  { id: "comic2", name: "Comic 2", path: "/images/cartoon_2.webp" },
]

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [detectedBubbles, setDetectedBubbles] = useState<
    Array<{ x: number; y: number; width: number; height: number }>
  >([])
  const [selectedBubble, setSelectedBubble] = useState<number | null>(null)
  const [bubbleText, setBubbleText] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [activeTab, setActiveTab] = useState("birthday")
  const [bubbleTexts, setBubbleTexts] = useState<string[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Birthday form state
  const [birthDay, setBirthDay] = useState("")
  const [birthMonth, setBirthMonth] = useState("")
  const [birthYear, setBirthYear] = useState("")
  const [selectedComicId, setSelectedComicId] = useState("")

  const handleBirthdaySubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!birthDay || !birthMonth || !birthYear || !selectedComicId) {
      setError("Please fill in all fields")
      return
    }

    // Find the selected comic
    const comic = COMIC_IMAGES.find((comic) => comic.id === selectedComicId)
    if (!comic) {
      setError("Invalid comic selection")
      return
    }

    // Load the selected comic image
    setSelectedImage(comic.path)
    setActiveTab("detection")
    setError(null)
  }

  const handleDetectBubbles = async () => {
    if (!selectedImage) return

    setIsProcessing(true)
    setError(null)

    try {
      // Create form data to send the image to the backend
      const formData = new FormData()

      // For pre-uploaded images, we need to fetch them first
      const imageResponse = await fetch(selectedImage)
      const imageBlob = await imageResponse.blob()

      formData.append("image", imageBlob, "comic.png")

      // Add birthday data
      formData.append("birthDay", birthDay)
      formData.append("birthMonth", birthMonth)
      formData.append("birthYear", birthYear)

      // Send to backend API
      const response = await fetch("/api/detect-bubbles", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`)
      }

      const data = await response.json()
      setDetectedBubbles(data.bubbles)

      if (data.bubbles.length > 0) {
        setActiveTab("editing")

        const birthdayText = `Happy Birthday! Born on ${birthMonth}/${birthDay}/${birthYear}`
        const newBubbleTexts = new Array(data.bubbles.length).fill("")
        newBubbleTexts[0] = birthdayText
        setBubbleTexts(newBubbleTexts)
      }
    } catch (err) {
      console.error("Error detecting bubbles:", err)
      setError("Failed to detect bubbles. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBubbleSelect = (index: number) => {
    setSelectedBubble(index)
    setBubbleText(bubbleTexts[index] || "")
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBubbleText(e.target.value)
    if (selectedBubble !== null) {
      const newBubbleTexts = [...bubbleTexts]
      newBubbleTexts[selectedBubble] = e.target.value
      setBubbleTexts(newBubbleTexts)
    }
  }

  useEffect(() => {
    if (detectedBubbles.length > 0 && bubbleTexts.length === 0) {
      setBubbleTexts(new Array(detectedBubbles.length).fill(""))
    }
  }, [detectedBubbles, bubbleTexts.length])

  useEffect(() => {
    if (selectedImage) {
      drawImageWithBubbles()
    }
  }, [selectedImage, detectedBubbles, selectedBubble, bubbleTexts, zoom])

  const drawImageWithBubbles = () => {
    if (!canvasRef.current || !selectedImage) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = selectedImage

    img.onload = () => {
      // Set canvas dimensions to match image with zoom
      canvas.width = img.width * zoom
      canvas.height = img.height * zoom

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw the image with zoom
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Draw detected bubbles
      detectedBubbles.forEach((bubble, index) => {
        // Apply zoom to bubble coordinates
        const scaledBubble = {
          x: bubble.x * zoom,
          y: bubble.y * zoom,
          width: bubble.width * zoom,
          height: bubble.height * zoom,
        }

        ctx.strokeStyle = selectedBubble === index ? "#FF3366" : "#00AAFF"
        ctx.lineWidth = 3
        ctx.strokeRect(scaledBubble.x, scaledBubble.y, scaledBubble.width, scaledBubble.height)

        // Add bubble number
        ctx.fillStyle = selectedBubble === index ? "#FF3366" : "#00AAFF"
        ctx.font = `${16 * zoom}px Arial`
        ctx.fillText(`Bubble ${index + 1}`, scaledBubble.x, scaledBubble.y - 5 * zoom)

        // Add text to bubble
        if (bubbleTexts[index]) {
          // Configure text style
          ctx.font = `${16 * zoom}px Arial`
          ctx.fillStyle = "#000000"
          ctx.textAlign = "center"

          // Word wrapping logic
          const maxWidth = scaledBubble.width - 20 * zoom
          const lineHeight = 20 * zoom
          const words = bubbleTexts[index].split(" ")
          let line = ""
          const lines = []

          for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + " "
            const metrics = ctx.measureText(testLine)

            if (metrics.width > maxWidth && i > 0) {
              lines.push(line)
              line = words[i] + " "
            } else {
              line = testLine
            }
          }
          lines.push(line)

          // Calculate vertical position to center text
          const textY = scaledBubble.y + scaledBubble.height / 2 - ((lines.length - 1) * lineHeight) / 2

          // Draw each line
          lines.forEach((line, lineIndex) => {
            ctx.fillText(line, scaledBubble.x + scaledBubble.width / 2, textY + lineIndex * lineHeight)
          })
        }
      })
    }
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    // Check if click is inside any bubble
    detectedBubbles.forEach((bubble, index) => {
      const scaledBubble = {
        x: bubble.x * zoom,
        y: bubble.y * zoom,
        width: bubble.width * zoom,
        height: bubble.height * zoom,
      }

      if (
        x >= scaledBubble.x &&
        x <= scaledBubble.x + scaledBubble.width &&
        y >= scaledBubble.y &&
        y <= scaledBubble.y + scaledBubble.height
      ) {
        handleBubbleSelect(index)
      }
    })
  }

  const handleSaveImage = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const link = document.createElement("a")
    link.download = "birthday-comic.png"
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  const handleZoomChange = (value: number[]) => {
    setZoom(value[0])
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Birthday Comic Bubble Generator</CardTitle>
          <CardDescription>
            Enter your birthday, select a comic, and add personalized text to speech bubbles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="birthday">Birthday Info</TabsTrigger>
              <TabsTrigger value="detection" disabled={!selectedImage}>
                Bubble Detection
              </TabsTrigger>
              <TabsTrigger value="editing" disabled={detectedBubbles.length === 0}>
                Text Editing
              </TabsTrigger>
            </TabsList>

            <TabsContent value="birthday">
              <form onSubmit={handleBirthdaySubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birthMonth">Birth Month</Label>
                    <Select value={birthMonth} onValueChange={setBirthMonth}>
                      <SelectTrigger id="birthMonth">
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                          <SelectItem key={month} value={month.toString()}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthDay">Birth Day</Label>
                    <Select value={birthDay} onValueChange={setBirthDay}>
                      <SelectTrigger id="birthDay">
                        <SelectValue placeholder="Day" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                          <SelectItem key={day} value={day.toString()}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthYear">Birth Year</Label>
                    <Input
                      id="birthYear"
                      type="number"
                      min="1900"
                      max="2023"
                      value={birthYear}
                      onChange={(e) => setBirthYear(e.target.value)}
                      placeholder="Year"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comicSelect">Select Comic</Label>
                  <Select value={selectedComicId} onValueChange={setSelectedComicId}>
                    <SelectTrigger id="comicSelect">
                      <SelectValue placeholder="Choose a comic" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMIC_IMAGES.map((comic) => (
                        <SelectItem key={comic.id} value={comic.id}>
                          {comic.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {error && <p className="text-red-500">{error}</p>}

                <Button type="submit" className="w-full">
                  Continue
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="detection">
              {selectedImage && (
                <div className="flex flex-col gap-6">
                  <div className="flex justify-between items-center">
                    <Button onClick={handleDetectBubbles} disabled={isProcessing}>
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Detecting...
                        </>
                      ) : (
                        "Detect Bubbles"
                      )}
                    </Button>
                    <div className="flex items-center gap-2">
                      <ZoomOut className="h-4 w-4" />
                      <Slider
                        value={[zoom]}
                        min={0.5}
                        max={2}
                        step={0.1}
                        onValueChange={handleZoomChange}
                        className="w-32"
                      />
                      <ZoomIn className="h-4 w-4" />
                    </div>
                  </div>

                  {error && <p className="text-red-500">{error}</p>}

                  <div className="max-w-full overflow-auto border rounded">
                    <canvas ref={canvasRef} onClick={handleCanvasClick} className="max-w-full h-auto cursor-pointer" />
                  </div>

                  {detectedBubbles.length > 0 && (
                    <div className="flex justify-between">
                      <p>{detectedBubbles.length} bubble(s) detected. Click on a bubble to select it.</p>
                      <Button onClick={() => setActiveTab("editing")}>Continue to Text Editing</Button>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="editing">
              {selectedImage && detectedBubbles.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Comic Preview</h3>
                      <div className="flex items-center gap-2">
                        <ZoomOut className="h-4 w-4" />
                        <Slider
                          value={[zoom]}
                          min={0.5}
                          max={2}
                          step={0.1}
                          onValueChange={handleZoomChange}
                          className="w-32"
                        />
                        <ZoomIn className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="max-w-full overflow-auto border rounded">
                      <canvas
                        ref={canvasRef}
                        onClick={handleCanvasClick}
                        className="max-w-full h-auto cursor-pointer"
                      />
                    </div>
                    <Button onClick={handleSaveImage} className="w-full">
                      <Download className="mr-2 h-4 w-4" /> Save Image
                    </Button>
                  </div>

                  <div>
                    <Card>
                      <CardHeader>
                        <CardTitle>Edit Bubble Text</CardTitle>
                        <CardDescription>
                          {selectedBubble === null ? "Select a bubble to edit" : `Editing Bubble ${selectedBubble + 1}`}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4">
                          <p className="text-sm text-gray-500 mb-2">Select a bubble:</p>
                          <div className="flex flex-wrap gap-2">
                            {detectedBubbles.map((_, index) => (
                              <Button
                                key={index}
                                variant={selectedBubble === index ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleBubbleSelect(index)}
                              >
                                Bubble {index + 1}
                              </Button>
                            ))}
                          </div>
                        </div>

                        <Textarea
                          placeholder="Enter text for the selected bubble..."
                          value={bubbleText}
                          onChange={handleTextChange}
                          rows={5}
                          className="mb-4"
                          disabled={selectedBubble === null}
                        />
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setBubbleText("")
                              if (selectedBubble !== null) {
                                const newBubbleTexts = [...bubbleTexts]
                                newBubbleTexts[selectedBubble] = ""
                                setBubbleTexts(newBubbleTexts)
                              }
                            }}
                            disabled={selectedBubble === null}
                          >
                            Clear
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  )
}
