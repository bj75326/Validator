# Validator
Custom Validation module, ok for AMD :)

## 用法
向Form表单中以各个表单组件的data-validate属性中添加以下参数中的一种或者多种：             
* 必选/必填 - required  
* 邮箱格式 - email  
* 移动电话 - phone  
* 固定电话 - phone2  
* 日期 - date  
* URL - URL  
* 用户名 - userName  
* 密码 - password  
* 密码确认 - password2  
* 姓名 - name  
以上有默认检验规则，可在options中添加errMsg属性自定义检验规则和错误信息。               

## 何时检验？
支持Form组件失去焦点或者提交时两种检验时机。  
默认情况：  
* 失去焦点检验["email", "phone", "phone2", "date", "url", "userName", "name", "password", "password2"]  
* 提交检验["required"]  
可在options中添加moment属性自定义或者覆盖检验时机。  

## 检验回调
支持在options中添加callback属性添加检验成功后的回调函数。  

# Demo: http://codepen.io/bj75326/pen/WGNbGO
