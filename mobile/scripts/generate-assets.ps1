Add-Type -AssemblyName System.Drawing

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$assetsDir = Join-Path (Split-Path -Parent $scriptDir) 'assets'
New-Item -ItemType Directory -Force -Path $assetsDir | Out-Null

function New-RoundedPath {
    param(
        [float]$X,
        [float]$Y,
        [float]$W,
        [float]$H,
        [float]$R
    )
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = $R * 2
    $path.AddArc($X, $Y, $d, $d, 180, 90)
    $path.AddArc($X + $W - $d, $Y, $d, $d, 270, 90)
    $path.AddArc($X + $W - $d, $Y + $H - $d, $d, $d, 0, 90)
    $path.AddArc($X, $Y + $H - $d, $d, $d, 90, 90)
    $path.CloseFigure()
    return $path
}

function New-CenterFormat {
    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center
    return $format
}

function Draw-Monogram {
    param(
        [System.Drawing.Graphics]$Graphics,
        [float]$SquareX,
        [float]$SquareY,
        [float]$SquareSize,
        [float]$FontSize,
        [bool]$Transparent
    )

    if (-not $Transparent) {
        $background = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(9, 8, 7))
        $Graphics.FillRectangle($background, 0, 0, 1024, 1024)
        $background.Dispose()
    }

    $gold = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(212, 175, 55))
    $path = New-RoundedPath $SquareX $SquareY $SquareSize $SquareSize ($SquareSize * 0.24)
    $Graphics.FillPath($gold, $path)
    $gold.Dispose()
    $path.Dispose()

    $dark = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(10, 9, 8))
    $font = New-Object System.Drawing.Font('Segoe UI', $FontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $format = New-CenterFormat
    $rect = [System.Drawing.RectangleF]::new($SquareX, ($SquareY - ($SquareSize * 0.025)), $SquareSize, $SquareSize)
    $Graphics.DrawString('M', $font, $dark, $rect, $format)

    $font.Dispose()
    $dark.Dispose()
    $format.Dispose()
}

# --- App icon: 1024 x 1024 -------------------------------------------------
$icon = New-Object System.Drawing.Bitmap(1024, 1024, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($icon)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
Draw-Monogram -Graphics $graphics -SquareX 192 -SquareY 192 -SquareSize 640 -FontSize 390 -Transparent $false
$icon.Save((Join-Path $assetsDir 'icon.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$icon.Dispose()

# --- Android adaptive icon foreground -------------------------------------
$adaptive = New-Object System.Drawing.Bitmap(1024, 1024, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($adaptive)
$graphics.Clear([System.Drawing.Color]::Transparent)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
Draw-Monogram -Graphics $graphics -SquareX 272 -SquareY 272 -SquareSize 480 -FontSize 294 -Transparent $true
$adaptive.Save((Join-Path $assetsDir 'adaptive-icon.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$adaptive.Dispose()

# --- Splash screen: 1242 x 2436 -------------------------------------------
$splash = New-Object System.Drawing.Bitmap(1242, 2436, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($splash)
$graphics.Clear([System.Drawing.Color]::FromArgb(9, 8, 7))
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

$ringPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(16, 212, 175, 55), 2)
$graphics.DrawEllipse($ringPen, 271, 728, 700, 700)
$ringPen.Dispose()
$innerPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(30, 212, 175, 55), 1)
$graphics.DrawEllipse($innerPen, 371, 828, 500, 500)
$innerPen.Dispose()

$gold = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(212, 175, 55))
$logoPath = New-RoundedPath 521 978 200 200 48
$graphics.FillPath($gold, $logoPath)
$logoPath.Dispose()

$dark = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(10, 9, 8))
$logoFont = New-Object System.Drawing.Font('Segoe UI', 124, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$center = New-CenterFormat
$logoRect = New-Object System.Drawing.RectangleF(521, 972, 200, 200)
$graphics.DrawString('M', $logoFont, $dark, $logoRect, $center)
$logoFont.Dispose()
$dark.Dispose()
$center.Dispose()

$nameFont = New-Object System.Drawing.Font('Segoe UI', 70, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(248, 245, 239))
$partOne = 'MindLink'
$partTwo = '.AI'
$widthOne = $graphics.MeasureString($partOne, $nameFont).Width
$widthTwo = $graphics.MeasureString($partTwo, $nameFont).Width
$nameX = (1242 - ($widthOne + $widthTwo - 18)) / 2
$graphics.DrawString($partOne, $nameFont, $white, $nameX, 1225)
$graphics.DrawString($partTwo, $nameFont, $gold, $nameX + $widthOne - 18, 1225)
$nameFont.Dispose()

$tagFont = New-Object System.Drawing.Font('Segoe UI', 23, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$tagFormat = New-CenterFormat
$tagRect = New-Object System.Drawing.RectangleF(0, 1335, 1242, 60)
$graphics.DrawString('S T U D E N T   P O R T A L', $tagFont, $gold, $tagRect, $tagFormat)
$tagFont.Dispose()
$tagFormat.Dispose()

$muted = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(120, 111, 101))
$lineFont = New-Object System.Drawing.Font('Segoe UI', 26, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$lineFormat = New-CenterFormat
$lineRect = New-Object System.Drawing.RectangleF(0, 1418, 1242, 60)
$graphics.DrawString('Learn without limits.', $lineFont, $muted, $lineRect, $lineFormat)
$lineFont.Dispose()
$lineFormat.Dispose()

$footerFont = New-Object System.Drawing.Font('Segoe UI', 17, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$footerFormat = New-CenterFormat
$footerRect = New-Object System.Drawing.RectangleF(0, 2240, 1242, 40)
$graphics.DrawString('mindlink.ai', $footerFont, $muted, $footerRect, $footerFormat)
$footerFont.Dispose()
$footerFormat.Dispose()

$white.Dispose()
$muted.Dispose()
$gold.Dispose()

$splash.Save((Join-Path $assetsDir 'splash.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$splash.Dispose()

# --- Favicon: 128 x 128 ----------------------------------------------------
$favicon = New-Object System.Drawing.Bitmap(128, 128, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($favicon)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
Draw-Monogram -Graphics $graphics -SquareX 16 -SquareY 16 -SquareSize 96 -FontSize 58 -Transparent $false
$favicon.Save((Join-Path $assetsDir 'favicon.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$favicon.Dispose()

Write-Host "Generated MindLink app assets in $assetsDir"
