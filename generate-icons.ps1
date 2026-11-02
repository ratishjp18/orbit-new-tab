Add-Type -AssemblyName System.Drawing

function New-OrbitIcon {
    param([int]$Size, [string]$Path)

    $bmp = New-Object System.Drawing.Bitmap($Size, $Size)
    $g   = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode      = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $s = [float]$Size

    # Rounded rectangle clip
    $r    = $s * 0.19
    $clip = New-Object System.Drawing.Drawing2D.GraphicsPath
    $clip.AddArc(0,       0,       $r*2, $r*2, 180, 90)
    $clip.AddArc($s-$r*2, 0,       $r*2, $r*2, 270, 90)
    $clip.AddArc($s-$r*2, $s-$r*2, $r*2, $r*2,   0, 90)
    $clip.AddArc(0,       $s-$r*2, $r*2, $r*2,  90, 90)
    $clip.CloseAllFigures()
    $g.SetClip($clip)

    # Background
    $bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 7, 0, 15))
    $g.FillRectangle($bgBrush, 0, 0, $s, $s)

    # Orbit ring
    $orbitPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(180, 139, 92, 246), [float]($s * 0.038))
    $g.DrawEllipse($orbitPen, [float]($s*0.09), [float]($s*0.36), [float]($s*0.82), [float]($s*0.28))

    # Planet
    $cx = $s * 0.50
    $cy = $s * 0.50
    $pr = $s * 0.23
    $pgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        [System.Drawing.PointF]::new($cx - $pr * 0.6, $cy - $pr * 0.6),
        [System.Drawing.PointF]::new($cx + $pr, $cy + $pr),
        [System.Drawing.Color]::FromArgb(255, 124, 58, 237),
        [System.Drawing.Color]::FromArgb(255, 46, 16, 101))
    $g.FillEllipse($pgBrush, $cx-$pr, $cy-$pr, $pr*2, $pr*2)

    # Planet highlight
    $hlBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(45, 255, 255, 255))
    $g.FillEllipse($hlBrush, $cx - $pr*0.55, $cy - $pr*0.65, $pr*0.66, $pr*0.55)

    # Moon
    $moonR = $s * 0.07
    $moonBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 196, 181, 253))
    $g.FillEllipse($moonBrush, [float]($s*0.855 - $moonR), [float]($s*0.50 - $moonR), $moonR*2, $moonR*2)

    # Stars
    $starBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(220, 255, 255, 255))
    $stars = @(
        @(0.14, 0.13, 0.028),
        @(0.83, 0.17, 0.022),
        @(0.17, 0.84, 0.024),
        @(0.81, 0.83, 0.018),
        @(0.11, 0.50, 0.016)
    )
    foreach ($star in $stars) {
        $sx = [float]($star[0] * $s)
        $sy = [float]($star[1] * $s)
        $sr = [float]($star[2] * $s)
        $g.FillEllipse($starBrush, $sx-$sr, $sy-$sr, $sr*2, $sr*2)
    }

    $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Created: $Path"
}

$iconsDir = Join-Path $PSScriptRoot "icons"
if (-not (Test-Path $iconsDir)) { New-Item -ItemType Directory -Path $iconsDir | Out-Null }

New-OrbitIcon -Size  16 -Path (Join-Path $iconsDir "icon16.png")
New-OrbitIcon -Size  48 -Path (Join-Path $iconsDir "icon48.png")
New-OrbitIcon -Size 128 -Path (Join-Path $iconsDir "icon128.png")

Write-Host "Done."
