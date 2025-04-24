<template>
  <div v-if="isError">
    <pre>
      {{ js_error.stack }}
    </pre>
    <el-collapse v-model="activeName" accordion>
      <el-collapse-item v-for="(item, index) in js_error.stack_frames" :key="index" :name="index" :title="item.source">
        <el-row :gutter="20">
          <el-col :span="20">
            <div>{{ item.fileName }}</div>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" size="small" @click="openDialog(item, index)">
              映射源码</el-button>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <template v-if="item.origin">
            <PreView :orgin="item.origin"></PreView>
          </template>
          <template v-else>
            <div>{{ item.fileName }}</div>
          </template>
        </el-row>
      </el-collapse-item>
    </el-collapse>
    <el-dialog v-model="dialogVisible" title="soureMap源码映射" width="500">
      <el-tabs v-model="tabActiveName" class="demo-tabs">
        <el-tab-pane label="本地上传" name="local">
          <el-upload drag :before-upload="sourceMapUpload">
            <i class="el-icon-upload"></i>
            <div>将文件拖到此处，或者<em>点击上传</em></div>
          </el-upload>
        </el-tab-pane>
        <el-tab-pane label="远程加载" name="request">远程加载</el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import sourceMap from 'source-map-js'
import { onMounted, ref } from 'vue';
import PreView from './PreView.vue';
const dialogVisible = ref(false);
const tabActiveName = ref('local');
const activeName = ref<string[]>(['1']);
const js_error = ref<any>(null);
const isError = ref(false);
let stackFrameObj = {
  line: 0,
  column: 0,
  index: 0,
};
onMounted(() => {
  try {
    // 获取本地存储的错误信息
    const jsErrorList = localStorage.getItem('jsErrorList');
    // 判断是否有错误信息，如果有则展示
    if (jsErrorList) {
      isError.value = true;
      js_error.value = JSON.parse(jsErrorList);
    }
  } catch (e) {
    console.log(e);
  }
});
const openDialog = (item: any, index: number) => {
  // 设置对话框可见性为true
  dialogVisible.value = true;
  // 设置堆栈帧对象
  stackFrameObj = {
    // 设置行号
    line: item.lineNumber,
    // 设置列号
    column: item.columnNumber,
    // 设置索引
    index: index,
  }
}

const sourceMapUpload = async (file: any) => {
  // 检查上传的文件是否为map文件
  if (file.name.substring(file.name.lastIndexOf('.') + 1) !== 'map') {
    // 提示用户上传正确的sourceMap文件
    ElMessage.error('请上传正确的sourceMap文件');
    return;
  }
  // 创建一个FileReader对象
  const reader = new FileReader();
  // 读取文件内容
  reader.readAsText(file, "utf-8");
  // 文件读取完成后的回调函数
  reader.onload = async function (evt) {
    // 从FileReader读取的结果中获取源代码
    const code = await getSource(evt.target?.result, stackFrameObj.line, stackFrameObj.column);
    // 更新错误信息的源代码
    js_error.value.stack_frames[stackFrameObj.index].origin = code;
    // 关闭对话框
    dialogVisible.value = false;
  }
  return false;
}

const getSource = async (sourcemap: any, line: number, column: number) => {
  try {
    // 创建一个SourceMapConsumer实例
    const consumer = await new sourceMap.SourceMapConsumer(JSON.parse(sourcemap));
    // 通过报错位置查找到对应的源文件名称以及报错行数
    // 获取原始代码位置
    const originalPosition = consumer.originalPositionFor({
      line: line,
      column: column
    });
    // 获取源文件的内容
    const source = consumer.sourceContentFor(originalPosition.source);
    // 返回源文件内容及其对应的行列信息
    return {
      source,
      column: originalPosition.column,
      line: originalPosition.line,
    }
  } catch (e) {
    // 显示错误信息
    ElMessage.error('sourceMap解析失败');
  }
}
</script>