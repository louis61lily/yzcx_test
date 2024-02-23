<template>
  <div class="boxEchart">
  </div>
</template>

<script setup>
import * as echarts from 'echarts'  
import { onMounted } from 'vue';
onMounted(()=>{
const Mychart = document.querySelector('.boxEchart')
    const chart = echarts.init(Mychart);
    const options = {
      graphic: {
        elements: [
          {
            type: 'text',
            left: 'center',
            top: 'center',
            style: {
              text: '柚智出行',
              fontSize: 80,
              fontWeight: 'bold',
              lineDash: [0, 200],
              lineDashOffset: 0,
              fill: 'transparent',
              stroke: '#000',
              lineWidth: 1
            },
            keyframeAnimation: {
              duration: 3000,
              loop: true,
              keyframes: [
                {
                  percent: 0.7,
                  style: {
                    fill: 'transparent',
                    lineDashOffset: 200,
                    lineDash: [200, 0]
                  }
                },
                {
                  // Stop for a while.
                  percent: 0.8,
                  style: {
                    fill: 'transparent'
                  }
                },
                {
                  percent: 1,
                  style: {
                    fill: '#909399'
                  }
                }
              ]
            }
          }
        ]
      }
    }
    chart.setOption(options)
})

</script>

<style>
.boxEchart {
  position: fixed;
  width: 100%;
  height:100%;
  opacity: 0.8;
  z-index: 9999;
  background-color: #ffffff;
}
</style>