"use client"
import type React from "react"
import Image from "next/image"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
export default function CalendarTable({ name, birthDay, birthMonth, birthYear }: { name: string, birthDay: string, birthMonth: string, birthYear: string }) {
  return (
    <div className="flex flex-col min-h-screen p-1 bg-[#F5F3EC] border-8">
      <div className="relative max-w-4xl w-full mx-auto">
        {/* Border and background */}
        <div
          className="border-1 border-navy-blue p-6 relative bg-[#F5F3EC]"
        >
          {/* Inner border */}
          <div className="border-none relative bg-cream">
            <div className="flex justify-evenly">
              <Image
                src='/images/cloud_left.svg'
                alt='cloud'
                width={90}
                height={50}
                className="h-auto"
                />
              <div className="flex flex-col w-full">
                <h1 className="text-center text-2xl font-extrabold">{name}님의 사주</h1>
                <h1 className="text-center text-2xl font-extrabold">{birthMonth}/{birthDay}/{birthYear}</h1>
              </div>
              <Image
                src='/images/cloud_right.svg'
                alt='cloud'
                width={90}
                height={50}
                className="h-auto"
                />
            </div>
            {/* Table */}
            <div className="mt-10">
              <Table >
                <TableHeader >
                  <TableRow className="border-none">
                    <TableHead className="border-none border-gray-800 p-3 text-2xl font-normal"></TableHead>
                    <TableHead className="border-2 border-gray-800 p-3 text-2xl font-normal text-center">年</TableHead>
                    <TableHead className="border-2 border-gray-800 p-3 text-2xl font-normal text-center">月</TableHead>
                    <TableHead className="border-2 border-gray-800 p-3 text-2xl font-normal text-center">日</TableHead>
                    <TableHead className="border-2 border-gray-800 p-3 text-2xl font-normal text-center">時</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="border-2 border-gray-800 p-3 text-lg">
                      十星
                      <br />
                      <span className='text-xs'>(십성)</span>
                    </TableCell>
                    <TableCell className="border border-gray-800 p-3 text-lg text-center">
                      傷官
                      <br />
                      <span className="text-xs">(상관)</span>
                    </TableCell>
                    <TableCell className="border border-gray-800 p-3 text-lg text-center">
                      傷官
                      <br />
                      <span className="text-xs">(상관)</span>
                    </TableCell>
                    <TableCell className="border border-gray-800 p-3 text-lg text-center">
                      比肩
                      <br />
                      <span className="text-xs">(비견)</span>
                    </TableCell>
                    <TableCell className="border border-gray-800 p-3 text-lg text-center">
                      傷官
                      <br />
                      <span className="text-xs">(상관)</span>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="border-2 border-gray-800 p-3 text-lg">
                      天干
                      <br />
                      <span className="text-xs">(천간)</span>
                    </TableCell>
                    <TableCell className="border border-gray-800 p-1">
                      <div className="bg-gray-800 text-white rounded-xl p-2 text-center">
                        <div className="text-xs">계</div>
                        <div className="text-2xl">癸</div>
                        <div className="text-xs">음수</div>
                      </div>
                    </TableCell>
                    <TableCell className="border border-gray-800 p-1">
                      <div className="bg-red-700 text-white rounded-xl p-2 text-center">
                        <div className="text-xs">정</div>
                        <div className="text-2xl">丁</div>
                        <div className="text-xs">음화</div>
                      </div>
                    </TableCell>
                    <TableCell className="border border-gray-800 p-1">
                      <div className="bg-gray-800 text-white rounded-xl p-2 text-center">
                        <div className="text-xs">계</div>
                        <div className="text-2xl">癸</div>
                        <div className="text-xs">음수</div>
                      </div>
                    </TableCell>
                    <TableCell className="border border-gray-800 p-1">
                      <div className="bg-gray-800 text-white rounded-xl p-2 text-center">
                        <div className="text-xs">계</div>
                        <div className="text-2xl">癸</div>
                        <div className="text-xs">음수</div>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="border-2 border-gray-800 p-3 text-lg">
                      地支
                      <br />
                      <span className="text-xs">(지지)</span>
                    </TableCell>
                    <TableCell className="border border-gray-800 p-1">
                      <div className="bg-teal-600 text-white rounded-xl p-2 text-center">
                        <div className="text-xs">인</div>
                        <div className="text-2xl">寅</div>
                        <div className="text-xs">음목</div>
                      </div>
                    </TableCell>
                    <TableCell className="border border-gray-800 p-1">
                      <div className="bg-red-700 text-white rounded-xl p-2 text-center">
                        <div className="text-xs">사</div>
                        <div className="text-2xl">巳</div>
                        <div className="text-xs">음화</div>
                      </div>
                    </TableCell>
                    <TableCell className="border border-gray-800 p-1">
                      <div className="bg-gray-800 text-white rounded-xl p-2 text-center">
                        <div className="text-xs">해</div>
                        <div className="text-2xl">亥</div>
                        <div className="text-xs">음수</div>
                      </div>
                    </TableCell>
                    <TableCell className="border border-gray-800 p-1">
                      <div className="bg-white border border-gray-300 rounded-xl p-2 text-center">
                        <div className="text-xs">유</div>
                        <div className="text-2xl">酉</div>
                        <div className="text-xs">음금</div>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="border-2 border-gray-800 p-3 text-lg">
                      十星
                      <br />
                      <span className="text-xs">(십성)</span>
                    </TableCell>
                    <TableCell className="border border-gray-800 p-3 text-lg text-center">
                      比肩
                      <br />
                      <span className="text-xs">(비견)</span>
                    </TableCell>
                    <TableCell className="border border-gray-800 p-3 text-lg text-center">
                      劫財
                      <br />
                      <span className="text-xs">(겁재)</span>
                    </TableCell>
                    <TableCell className="border border-gray-800 p-3 text-lg text-center">
                      食神
                      <br />
                      <span className="text-xs">(식신)</span>
                    </TableCell>
                    <TableCell className="border border-gray-800 p-3 text-lg text-center">
                      偏財
                      <br />
                      <span className="text-xs">(편재)</span>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="border-2 border-gray-800 p-3 text-lg">
                      十二運星
                      <br />
                      <span className="text-xs">(십이운성)</span>
                    </TableCell>
                    <TableCell className="border border-gray-800 p-3 text-lg text-center">
                      死<br />
                      <span className="text-xs">(사)</span>
                    </TableCell>
                    <TableCell className="border border-gray-800 p-3 text-lg text-center">
                      帝旺
                      <br />
                      <span className="text-xs">(제왕)</span>
                    </TableCell>
                    <TableCell className="border border-gray-800 p-3 text-lg text-center">
                      胎<br />
                      <span className="text-xs">(태)</span>
                    </TableCell>
                    <TableCell className="border border-gray-800 p-3 text-lg text-center">
                      長生
                      <br />
                      <span className="text-xs">(장생)</span>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="border-2 border-gray-800 p-3 text-lg">
                      十二神殺
                      <br />
                      <span className="text-xs">(십이신살)</span>
                    </TableCell>
                    <TableCell className="border border-gray-800 p-3 text-lg text-center">
                      劫殺
                      <br />
                      <span className="text-xs">(겁살)</span>
                    </TableCell>
                    <TableCell className="border border-gray-800 p-3 text-lg text-center">
                      地殺
                      <br />
                      <span className="text-xs">(지살)</span>
                    </TableCell>
                    <TableCell className="border border-gray-800 p-3 text-lg text-center">
                      驛馬殺
                      <br />
                      <span className="text-xs">(역마살)</span>
                    </TableCell>
                    <TableCell className="border border-gray-800 p-3 text-lg text-center">
                      將星殺
                      <br />
                      <span className="text-xs">(장성살)</span>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="border-2 border-gray-800 p-3 text-lg" rowSpan={2}>
                      貴人
                      <br />
                      <span className="text-xs">(귀인)</span>
                    </TableCell>
                    <TableCell className="border border-gray-800 p-3 text-lg text-center" rowSpan={2}>(없음)</TableCell>
                    <TableCell className="border border-gray-800 p-3 text-lg text-center" rowSpan={2}>(없음)</TableCell>
                    <TableCell className="border border-gray-800 p-3 text-lg text-center" >
                      天乙
                      <br />
                      <span className="text-xs">(천을귀인)</span>
                    </TableCell>
                    <TableCell className="border border-gray-800 p-3 text-lg text-center" rowSpan={2}>
                      天乙
                      <br />
                      <span className="text-xs">(천을귀인)</span>
                      <br />
                      太極
                      <br />
                      <span className="text-xs">(태극귀인)</span>
                      <br />
                      文昌
                      <br />
                      <span className="text-xs">(문창귀인)</span>
                    </TableCell>
                  </TableRow>
                  {/* <TableRow>
                    <TableCell className="border border-gray-800 p-3 text-lg" colSpan={2}></TableCell>
                    <TableCell className="border border-gray-800 p-3 text-lg"></TableCell>
                  </TableRow> */}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
