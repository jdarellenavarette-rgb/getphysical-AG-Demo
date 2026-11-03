using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Drawing.Text;

public class HighQualityLogoGenerator {
    public static void Main() {
        string rawPath = @"C:\Users\Honzel Cayobit\.gemini\antigravity\scratch\getphysical-AG-Demo\apps\mobile\scripts\extracted_gp_raw.png";
        string emblemOutPath = @"C:\Users\Honzel Cayobit\.gemini\antigravity\scratch\getphysical-AG-Demo\apps\mobile\assets\gp_emblem_hd.png";
        string splashOutPath = @"C:\Users\Honzel Cayobit\.gemini\antigravity\scratch\getphysical-AG-Demo\apps\mobile\assets\gp_splash_native.png";

        Bitmap srcBmp = new Bitmap(rawPath);
        int srcW = srcBmp.Width;
        int srcH = srcBmp.Height;

        // Extract binary & continuous coverage mask
        float[,] coverage = new float[srcW, srcH];
        for (int y = 0; y < srcH; y++) {
            for (int x = 0; x < srcW; x++) {
                Color c = srcBmp.GetPixel(x, y);
                float rDiff = (float)c.R - Math.Max(c.G, c.B);
                float cov = 0f;
                if (c.R > 40) {
                    cov = Math.Max(0f, Math.Min(1f, (rDiff - 10f) / 32f));
                }
                coverage[x, y] = cov;
            }
        }

        // Clean small isolated noise (< 0.25f)
        for (int y = 0; y < srcH; y++) {
            for (int x = 0; x < srcW; x++) {
                if (coverage[x, y] < 0.25f) coverage[x, y] = 0f;
            }
        }

        // Target high-definition retina resolution (8x)
        int scale = 8;
        int pad = 24; // padding around emblem in high-res pixels
        int targetW = srcW * scale + pad * 2;
        int targetH = srcH * scale + pad * 2;

        Bitmap emblemBmp = new Bitmap(targetW, targetH, PixelFormat.Format32bppArgb);
        int searchRadius = 5;

        // 3-stop gradient colors:
        // Stop 0.0 (bottom-left): Hot Pink / Vivid Magenta #FE4A7E (RGB: 254, 74, 126)
        // Stop 0.5 (middle): Vibrant Coral #FF7272 (RGB: 255, 114, 114)
        // Stop 1.0 (top-right): Sunset Peach / Neon Orange #FFA070 (RGB: 255, 160, 112)

        for (int ty = 0; ty < targetH; ty++) {
            float sy = (float)(ty - pad) / scale;
            for (int tx = 0; tx < targetW; tx++) {
                float sx = (float)(tx - pad) / scale;

                if (sx < -1 || sx > srcW || sy < -1 || sy > srcH) continue;

                int baseSx = (int)Math.Floor(sx);
                int baseSy = (int)Math.Floor(sy);

                float fx = sx - baseSx;
                float fy = sy - baseSy;

                float c00 = GetCoverage(coverage, baseSx, baseSy, srcW, srcH);
                float c10 = GetCoverage(coverage, baseSx + 1, baseSy, srcW, srcH);
                float c01 = GetCoverage(coverage, baseSx, baseSy + 1, srcW, srcH);
                float c11 = GetCoverage(coverage, baseSx + 1, baseSy + 1, srcW, srcH);
                float interpCov = (1f - fx) * (1f - fy) * c00 + fx * (1f - fy) * c10 + (1f - fx) * fy * c01 + fx * fy * c11;

                float minDistSq = float.MaxValue;
                bool isInside = interpCov >= 0.5f;

                int minKx = Math.Max(0, baseSx - searchRadius);
                int maxKx = Math.Min(srcW - 1, baseSx + searchRadius);
                int minKy = Math.Max(0, baseSy - searchRadius);
                int maxKy = Math.Min(srcH - 1, baseSy + searchRadius);

                for (int ky = minKy; ky <= maxKy; ky++) {
                    for (int kx = minKx; kx <= maxKx; kx++) {
                        float kCov = coverage[kx, ky];
                        if (isInside ? (kCov < 0.5f) : (kCov >= 0.5f)) {
                            float dx = sx - (kx + 0.5f);
                            float dy = sy - (ky + 0.5f);
                            float d2 = dx * dx + dy * dy;
                            if (d2 < minDistSq) minDistSq = d2;
                        }
                    }
                }

                float dist = (float)Math.Sqrt(minDistSq);
                float signedDist = isInside ? dist : -dist;

                // Smooth anti-aliased edge over 2 high-res pixels
                float edgeWidth = 1.6f / scale;
                float alpha = (signedDist + edgeWidth) / (2f * edgeWidth);
                alpha = Math.Max(0f, Math.Min(1f, alpha));

                if (alpha > 0.005f) {
                    // Normalized coordinates for gradient
                    float u = (float)tx / targetW;
                    float v = 1.0f - ((float)ty / targetH);
                    float t = Math.Max(0f, Math.Min(1f, 0.42f * u + 0.58f * v));

                    float r, g, b;
                    if (t < 0.5f) {
                        float localT = t / 0.5f;
                        r = 254f + (255f - 254f) * localT;
                        g = 74f + (114f - 74f) * localT;
                        b = 126f + (114f - 126f) * localT;
                    } else {
                        float localT = (t - 0.5f) / 0.5f;
                        r = 255f;
                        g = 114f + (160f - 114f) * localT;
                        b = 114f + (112f - 114f) * localT;
                    }

                    int ca = (int)(alpha * 255f);
                    emblemBmp.SetPixel(tx, ty, Color.FromArgb(ca, (int)r, (int)g, (int)b));
                }
            }
        }

        emblemBmp.Save(emblemOutPath, ImageFormat.Png);
        Console.WriteLine(string.Format("Saved HD emblem: {0}x{1} -> {2}", targetW, targetH, emblemOutPath));

        // Render full native splash screen (1284 x 2778)
        int splashW = 1284;
        int splashH = 2778;
        using (Bitmap splashBmp = new Bitmap(splashW, splashH, PixelFormat.Format32bppArgb))
        using (Graphics g = Graphics.FromImage(splashBmp)) {
            g.SmoothingMode = SmoothingMode.AntiAlias;
            g.InterpolationMode = InterpolationMode.HighQualityBicubic;
            g.TextRenderingHint = TextRenderingHint.AntiAliasGridFit;

            // Matte dark slate background #151517
            Color bg = Color.FromArgb(255, 21, 21, 23);
            g.Clear(bg);

            // Draw emblem centered
            int dispEmblemW = 540;
            int dispEmblemH = (int)((float)targetH / targetW * dispEmblemW);
            int emblemX = (splashW - dispEmblemW) / 2;
            int emblemY = (splashH / 2) - dispEmblemH - 40;

            g.DrawImage(emblemBmp, new Rectangle(emblemX, emblemY, dispEmblemW, dispEmblemH));

            // Draw "getphysical"
            using (Font titleFont = new Font("Arial", 54f, FontStyle.Bold | FontStyle.Italic, GraphicsUnit.Pixel))
            using (SolidBrush whiteBrush = new SolidBrush(Color.White))
            using (StringFormat sf = new StringFormat()) {
                sf.Alignment = StringAlignment.Center;
                sf.LineAlignment = StringAlignment.Center;

                float titleY = emblemY + dispEmblemH + 60;
                g.DrawString("getphysical", titleFont, whiteBrush, new PointF(splashW / 2f, titleY), sf);

                // Draw "Welcome to GetPhysical"
                using (Font subFont = new Font("Arial", 28f, FontStyle.Regular, GraphicsUnit.Pixel))
                using (SolidBrush subBrush = new SolidBrush(Color.FromArgb(255, 156, 163, 175))) {
                    float subY = titleY + 56;
                    g.DrawString("Welcome to GetPhysical", subFont, subBrush, new PointF(splashW / 2f, subY), sf);
                }
            }

            splashBmp.Save(splashOutPath, ImageFormat.Png);
            Console.WriteLine(string.Format("Saved native splash: {0}x{1} -> {2}", splashW, splashH, splashOutPath));
        }

        srcBmp.Dispose();
        emblemBmp.Dispose();
    }

    private static float GetCoverage(float[,] map, int x, int y, int w, int h) {
        if (x < 0 || x >= w || y < 0 || y >= h) return 0f;
        return map[x, y];
    }
}
