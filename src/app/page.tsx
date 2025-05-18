'use client'
import { useEffect, useRef, useState } from 'react';
import Image from "next/image";
import CalendarTable from '@/components/CalendarTable'
import { Button } from '@/components/ui/button';
import { Select, SelectItem, SelectContent, SelectValue, SelectTrigger } from '@/components/ui/select';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from '@/components/ui/input';

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const COMIC_IMAGES = [
    { id: "comic1", name: "Comic 1", path: "/images/comic1.png" },
    { id: "comic2", name: "Comic 2", path: "/images/comic2.png" },
  ] as const

  const [detectedFirstBubble, setDetectedFirstBubble] = useState<
    Array<{ x: number; y: number; width: number; height: number; bubbleText: string }>
  >([])
  const [detectedSecondBubble, setDetectedSecondBubble] = useState<
    Array<{ x: number; y: number; width: number; height: number; bubbleText: string }>
  >([])
  const [selectedBubble, setSelectedBubble] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Birthday form state
  const [name, setName] = useState("")
  const [birthDay, setBirthDay] = useState("")
  const [birthMonth, setBirthMonth] = useState("")
  const [birthYear, setBirthYear] = useState("")
  const [result, setResult] = useState("")
  const [displayImages, setDisplayImages] = useState<string[]>([])

  // Add new state for second image bubble texts
  const [bubbleTexts1, setBubbleTexts1] = useState<string[]>([])
  const [bubbleTexts2, setBubbleTexts2] = useState<string[]>([])

  const formSchema = z.object({
    name: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }),
    birthDay: z.string().min(1, {
      message: "Day is required",
    }).refine((day) => {
      const month = parseInt(birthMonth)
      const dayNum = parseInt(day)

      if (month === 2) {
        const year = parseInt(birthYear)
        const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
        const maxDays = isLeapYear ? 29 : 28
        return dayNum <= maxDays
      } else if ([4, 6, 9, 11].includes(month)) {
        return dayNum <= 30
      } else if ([1, 3, 5, 7, 8, 10, 12].includes(month)) {
        return dayNum <= 31
      }
      return true
    }, {
      message: "Invalid day for the selected month"
    }),
    birthMonth: z.string().min(1, {
      message: "Month is required",
    }),
    birthYear: z.string().min(1, {
      message: "Year is required",
    }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: name,
      birthDay: birthDay,
      birthMonth: birthMonth,
      birthYear: birthYear,
    },
  })

  // Watch form changes and update state variables
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.name !== undefined) setName(value.name)
      if (value.birthDay !== undefined) setBirthDay(value.birthDay)
      if (value.birthMonth !== undefined) setBirthMonth(value.birthMonth)
      if (value.birthYear !== undefined) setBirthYear(value.birthYear)
    })
    return () => subscription.unsubscribe()
  }, [form])

  const handleBirthdaySubmit = (data: z.infer<typeof formSchema>) => {
    if (!data.name || !data.birthDay || !data.birthMonth || !data.birthYear) {
      setError("Please fill in all fields")
      return
    }

    if (parseInt(data.birthDay) > 31 || parseInt(data.birthDay) < 1) {
      setError("Invalid day, please enter a valid day")
      return
    }

    // Validate days based on months
    if (parseInt(data.birthMonth) === 2) {
      if (parseInt(data.birthDay) > 29) {
        setError("Invalid day, February has only 29 days")
        return
      }
    } else if ([4, 6, 9, 11].includes(parseInt(data.birthMonth))) {
      // April, June, September, November have 30 days
      if (parseInt(data.birthDay) > 30) {
        setError(`Invalid day, ${getMonthName(parseInt(data.birthMonth))} has only 30 days`)
        return
      }
    } else if ([1, 3, 5, 7, 8, 10, 12].includes(parseInt(data.birthMonth))) {
      // January, March, May, July, August, October, December have 31 days
      if (parseInt(data.birthDay) > 31) {
        setError(`Invalid day, ${getMonthName(parseInt(data.birthMonth))} has only 31 days`)
        return
      }
    }

    // Helper function to get month name
    function getMonthName(month: number): string {
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ]
      return months[month - 1]
    }

    // Set the images to display
    setDisplayImages(["/images/comic1.png", "/images/comic2.png"])
    setError(null)
    handleDetectBubbles(data)
  }

  const handleDetectBubbles = async (formData: z.infer<typeof formSchema>) => {
    setIsProcessing(true)
    setError(null)
    try {
      // Create form data to send the image to the backend
      const formDataToSend = new FormData()

      // Send the image path directly
      formDataToSend.append("image1", COMIC_IMAGES[0].path)
      formDataToSend.append("image2", COMIC_IMAGES[1].path)

      // Add birthday data using the passed form data
      formDataToSend.append("name", formData.name)
      formDataToSend.append("birthDay", formData.birthDay)
      formDataToSend.append("birthMonth", formData.birthMonth)
      formDataToSend.append("birthYear", formData.birthYear)

      // Send to backend API
      const response = await fetch("/api/detect-bubbles", {
        method: "POST",
        body: formDataToSend,
      })

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`)
      }

      const data = await response.json()

      // Process first image bubbles
      const bubblesWithText1 = data.bubbles.image1.map((bubble: any) => ({
        ...bubble,
        bubbleText: bubbleTexts1[data.bubbles.image1.indexOf(bubble)] || ""
      }))
      setDetectedFirstBubble(bubblesWithText1)

      // Process second image bubbles
      const bubblesWithText2 = data.bubbles.image2.map((bubble: any) => ({
        ...bubble,
        bubbleText: bubbleTexts2[data.bubbles.image2.indexOf(bubble)] || ""
      }))
      setDetectedSecondBubble(bubblesWithText2)

      const birthdayText = `${formData.name}! Born on ${formData.birthMonth}/${formData.birthDay}/${formData.birthYear}`
      const birthdayText2 = `${formData.name}! your fortune is...`

      // Set texts for first image bubbles
      const newBubbleTexts1 = new Array(data.bubbles.image1.length).fill("")
      newBubbleTexts1[0] = birthdayText
      setBubbleTexts1(newBubbleTexts1)

      // Set texts for second image bubbles
      const newBubbleTexts2 = new Array(data.bubbles.image2.length).fill("")
      newBubbleTexts2[0] = birthdayText2
      setBubbleTexts2(newBubbleTexts2)

      setSelectedBubble(1)
      setResult("completed")
    } catch (err) {
      console.error("Error detecting bubbles:", err)
      setError("Failed to detect bubbles. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    if (detectedFirstBubble.length > 0 && bubbleTexts1.length === 0) {
      setBubbleTexts1(new Array(detectedFirstBubble.length).fill(""))
    }
    if (detectedSecondBubble.length > 0 && bubbleTexts2.length === 0) {
      setBubbleTexts2(new Array(detectedSecondBubble.length).fill(""))
    }
  }, [detectedFirstBubble, bubbleTexts1.length, detectedSecondBubble, bubbleTexts2.length])

  useEffect(() => {
    if (selectedImage) {
      drawImageWithBubbles()
    }
  }, [selectedImage, detectedFirstBubble, selectedBubble, bubbleTexts1, bubbleTexts2])

  const drawImageWithBubbles = () => {
    if (!canvasRef.current || !selectedImage) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new window.Image()
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
      detectedFirstBubble.forEach((bubble, index) => {
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
        if (bubbleTexts1[index]) {
          // Configure text style
          ctx.font = `${16 * zoom}px Arial`
          ctx.fillStyle = "#000000"
          ctx.textAlign = "center"

          // Word wrapping logic
          const maxWidth = scaledBubble.width - 20 * zoom
          const lineHeight = 20 * zoom
          const words = bubbleTexts1[index].split(" ")
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

      detectedSecondBubble.forEach((bubble, index) => {
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
        if (bubbleTexts2[index]) {
          // Configure text style
          ctx.font = `${16 * zoom}px Arial`
          ctx.fillStyle = "#000000"
          ctx.textAlign = "center"

          // Word wrapping logic
          const maxWidth = scaledBubble.width - 20 * zoom
          const lineHeight = 20 * zoom
          const words = bubbleTexts2[index].split(" ")
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


  return (
    <div className="min-h-screen flex flex-col max-w-screen-sm mx-auto font-noto-serif-kr md:p-0 p-4">
      <main className="flex flex-col gap-1 justify-center items-center">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleBirthdaySubmit)} className="space-y-6 w-full">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="name">Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="birthMonth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="birthMonth">Birth Month</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
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
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="birthDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="birthDay">Birth Day</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          id="birthDay"
                          type="number"
                          min="1"
                          max="31"
                          placeholder="Day"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="birthYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="birthYear">Birth Year</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          id="birthYear"
                          type="number"
                          min="1900"
                          max="2023"
                          placeholder="Year"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {error && <p className="text-red-500">{error}</p>}

            <Button
              variant="outline"
              type="submit"
              className="w-full bg-black text-white cursor-pointer">
              Continue
            </Button>
          </form>
        </Form>
        <div className="relative md:w-[360px] w-full mx-auto space-y-6">
          {displayImages.map((imagePath, index) => (
            <Image
              key={index}
              src={imagePath}
              alt={`Comic ${index + 1}`}
              width={360}
              height={0}
              className="md:w-[500px] h-auto"
              priority
            />
          ))}

          {detectedFirstBubble.slice(2, 3).map((bubble, index) => (
            <div
              key={index}
              className="absolute border-none noto-serif-kr font-sm"
              style={{
                left: `${bubble.x}px`,
                top: `${bubble.y}px`,
                width: `${bubble.width}px`,
                height: `${bubble.height}px`
              }}
            >
              <p className="text-center text-black z-50 mt-10">
                {bubbleTexts1[index]}
              </p>
            </div>
          ))}

          {detectedSecondBubble.slice(2, 3).map((bubble, index) => (
            <div
              key={index}
              className="relative border-none noto-serif-kr font-sm"
              style={{
                left: `${bubble.x}px`,
                top: `-${bubble.y}px`,
                width: `${bubble.width}px`,
                height: `${bubble.height}px`
              }}
            >
              <p className="text-center text-black z-[100] -mt-40">
                {bubbleTexts2[index]}
              </p>
            </div>
          ))}

          {result && <CalendarTable name={name} birthDay={birthDay} birthMonth={birthMonth} birthYear={birthYear} />}
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
      </footer>
    </div>
  );
}
