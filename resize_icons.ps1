Add-Type -AssemblyName System.Drawing

# 源图片路径
$sourcePath = ".\assets\icons\f580591dbd21dfaa4125fe2583c39f8a.jpg"

# 目标尺寸和文件名
$sizes = @(
    @{Size = 16; FileName = "icon16.png"},
    @{Size = 48; FileName = "icon48.png"},
    @{Size = 128; FileName = "icon128.png"}
)

# 检查源文件是否存在
if (-not (Test-Path $sourcePath)) {
    Write-Host "Error: Source image file not found: $sourcePath"
    exit 1
}

# 加载源图片
$sourceImage = [System.Drawing.Image]::FromFile((Resolve-Path $sourcePath))

foreach ($item in $sizes) {
    $size = $item.Size
    $fileName = $item.FileName
    $outputPath = ".\assets\icons\$fileName"
    
    Write-Host "Creating $size x $size icon: $outputPath"
    
    # 创建一个新的位图
    $bitmap = New-Object System.Drawing.Bitmap $size, $size
    
    # 创建Graphics对象
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    
    # 设置插值模式以获得更好的缩放质量
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    # 绘制调整大小的图像
    $graphics.DrawImage($sourceImage, (New-Object System.Drawing.Rectangle 0, 0, $size, $size))
    
    # 保存为PNG
    $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    # 释放资源
    $graphics.Dispose()
    $bitmap.Dispose()
}

# 释放源图像资源
$sourceImage.Dispose()

Write-Host "All icons created successfully!"
