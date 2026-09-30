<template>
  <div class="min-h-screen bg-[#2A6049] flex items-center justify-center p-4">
    <div class="relative bg-[#1C1108] rounded-[44px] shadow-2xl overflow-hidden" style="width:390px;height:844px;box-shadow:0 0 0 2px #3d3d3d,0 40px 80px rgba(0,0,0,.5)">
      <div class="absolute top-0 left-0 right-0 h-12 z-50 flex items-center justify-between px-6 pt-2 pointer-events-none">
        <span class="text-white text-xs font-semibold">9:41</span>
        <div class="w-28 h-6 bg-[#1C1108] rounded-full absolute left-1/2 -translate-x-1/2 top-0"></div>
        <span class="text-white text-xs">●●●</span>
      </div>
      <div class="absolute inset-0 rounded-[44px] overflow-hidden bg-[#F5F0E8]">
        <div class="h-full flex flex-col pt-12"><slot /></div>
      </div>
    </div>
  </div>
</template>
