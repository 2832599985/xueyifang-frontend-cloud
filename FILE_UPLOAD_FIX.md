# 文件上传问题修复说明

## 问题描述
1. 第一个错误：后端日志显示 `Required request parameter 'biz' for method parameter type String is not present`
2. 第二个错误：`不支持的业务类型: service`

## 根本原因
1. 后端的文件上传接口 `/api/file/upload` 需要一个必需的参数 `biz`（业务类型）
2. 后端只支持特定的 biz 值，定义在 `FileUploadBizEnum` 枚举中

## 后端支持的业务类型
在 `FileUploadBizEnum.java` 中定义：
- `user_avatar` - 用户头像（最大1MB）
- `service_image` - 服务图片（最大5MB）

## 修复方案

### 1. 使用正确的 biz 参数值
已修改文件：
- `/src/views/service/ServicePublish.vue`
- `/src/views/service/ServiceEdit.vue`

修改内容：
```javascript
// 错误的值
const uploadUrl = '/backend/api/file/upload?biz=service'

// 正确的值
const uploadUrl = '/backend/api/file/upload?biz=service_image'
```

### 2. 添加 tradeLocationId 字段
已修改文件：
- `/src/types/service.ts` - 添加到 ServiceFormData、ServicePublishRequest、ServiceUpdateRequest
- `/src/views/service/ServicePublish.vue` - 添加到表单数据和验证规则
- `/src/views/service/ServiceEdit.vue` - 添加到表单数据和验证规则

### 3. 条件验证规则
为线下交易添加了交易地点的条件验证：
```javascript
tradeLocationId: [
  {
    required: false,
    validator: (rule, value, callback) => {
      if (form.tradeType === 1 && !value) {
        callback(new Error('线下交易必须选择交易地点'))
      } else {
        callback()
      }
    }
  }
]
```

## 测试步骤
1. 清除浏览器缓存
2. 重新加载页面
3. 尝试上传图片
4. 如果还有问题，检查后端 FileController 的 `biz` 参数是否为可选（@RequestParam(required = false)）

## 后端 FileController 配置
后端方法签名：
```java
@PostMapping("/upload")
public BaseResponse<String> upload(
    @RequestParam("file") MultipartFile file,
    @RequestParam("biz") String biz  // 必需参数，只接受枚举中定义的值
) {
    // 根据 biz 类型处理文件
    // FileUploadBizEnum.getEnumByValue(biz) 验证业务类型
}
```

## 文件大小限制
- 用户头像：最大 1MB (1048576 字节)
- 服务图片：最大 5MB (5242880 字节)

## 支持的文件类型
默认支持的图片格式：jpg, jpeg, png, gif, webp