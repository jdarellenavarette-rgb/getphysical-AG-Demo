using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;

public class LogoRenderer {
    public static void AddRoundedRect(GraphicsPath path, float x, float y, float width, float height, float radius) {
        float d = radius * 2f;
        path.AddArc(x, y, d, d, 180, 90);
        path.AddLine(x + radius, y, x + width - radius, y);
        path.AddArc(x + width - d, y, d, d, 270, 90);
        path.AddLine(x + width, y + radius, x + width, y + height - radius);
        path.AddArc(x + width - d, y + height - d, d, d, 0, 90);
        path.AddLine(x + width - radius, y + height, x + radius, y + height);
        path.AddArc(x, y + height - d, d, d, 90, 90);
        path.CloseFigure();
    }

    public static Bitmap GenerateEmblemBitmap(int scale) {
        int targetW = 140 * scale;
        int targetH = 58 * scale;
        float s = scale;
        
        Bitmap bmp = new Bitmap(targetW, targetH, PixelFormat.Format32bppArgb);
        using (Graphics g = Graphics.FromImage(bmp)) {
            g.SmoothingMode = SmoothingMode.AntiAlias;
            g.InterpolationMode = InterpolationMode.HighQualityBicubic;
            g.PixelOffsetMode = PixelOffsetMode.HighQuality;
            g.Clear(Color.Transparent);

            Matrix m = new Matrix();
            m.Translate(100f, 0f);
            m.Shear(-0.35f, 0f);
            g.Transform = m;

            // Brand Gradient: Vibrant Rose/Pink (#FF2A75) to Warm Coral/Peach (#FFA070)
            RectangleF brushRect = new RectangleF(0, 0, 100f * s, 58f * s);
            Color cStart = Color.FromArgb(255, 255, 42, 117); // #FF2A75
            Color cEnd = Color.FromArgb(255, 255, 160, 112);  // #FFA070
            
            using (LinearGradientBrush brush = new LinearGradientBrush(brushRect, cStart, cEnd, 0f)) {
                // LETTER G
                float rOut = 14f * s;
                GraphicsPath outerG = new GraphicsPath();
                AddRoundedRect(outerG, 0, 0, 48f * s, 58f * s, rOut);

                GraphicsPath innerHoleG = new GraphicsPath();
                AddRoundedRect(innerHoleG, 12f * s, 12f * s, 20f * s, 34f * s, 4f * s);

                GraphicsPath gapG = new GraphicsPath();
                gapG.AddRectangle(new RectangleF(32f * s, 12f * s, 20f * s, 14f * s));

                Region regG = new Region(outerG);
                regG.Exclude(innerHoleG);
                regG.Exclude(gapG);
                g.FillRegion(brush, regG);

                // LETTER P
                float xP = 54f * s;
                float wStem = 14f * s;
                float hLoop = 32f * s;
                float rLoop = hLoop / 2f;
                float rightP = 96f * s;

                GraphicsPath outerP = new GraphicsPath();
                outerP.AddLine(xP, 0, rightP - rLoop, 0);
                outerP.AddArc(rightP - rLoop * 2, 0, rLoop * 2, rLoop * 2, 270, 180);
                outerP.AddLine(rightP - rLoop, hLoop, xP + wStem, hLoop);
                outerP.AddLine(xP + wStem, hLoop, xP + wStem, 58f * s);
                outerP.AddLine(xP + wStem, 58f * s, xP, 58f * s);
                outerP.CloseFigure();

                float yHole = 12f * s;
                float rightHole = 84f * s;

                GraphicsPath innerHoleP = new GraphicsPath();
                innerHoleP.AddLine(xP + wStem, yHole, rightHole - 4f * s, yHole);
                innerHoleP.AddArc(rightHole - 8f * s, yHole, 8f * s, 8f * s, 270, 180);
                innerHoleP.AddLine(rightHole - 4f * s, yHole + 8f * s, xP + wStem, yHole + 8f * s);
                innerHoleP.CloseFigure();

                Region regP = new Region(outerP);
                regP.Exclude(innerHoleP);
                g.FillRegion(brush, regP);
            }
        }
        return bmp;
    }

    public static void RenderAll(string emblemPath, string fullSplashPath) {
        using (Bitmap raw = GenerateEmblemBitmap(10)) {
            // Trim bounds
            int minX = raw.Width, minY = raw.Height, maxX = 0, maxY = 0;
            for (int y = 0; y < raw.Height; y++) {
                for (int x = 0; x < raw.Width; x++) {
                    if (raw.GetPixel(x, y).A > 10) {
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                    }
                }
            }

            int pad = 20;
            int cropW = (maxX - minX + 1);
            int cropH = (maxY - minY + 1);
            int outW = cropW + pad * 2;
            int outH = cropH + pad * 2;

            // 1. Save trimmed HD Emblem
            using (Bitmap trimmed = new Bitmap(outW, outH, PixelFormat.Format32bppArgb))
            using (Graphics g = Graphics.FromImage(trimmed)) {
                g.SmoothingMode = SmoothingMode.AntiAlias;
                g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                g.PixelOffsetMode = PixelOffsetMode.HighQuality;
                g.Clear(Color.Transparent);
                g.DrawImage(raw, new Rectangle(pad, pad, cropW, cropH), new Rectangle(minX, minY, cropW, cropH), GraphicsUnit.Pixel);
                trimmed.Save(emblemPath, ImageFormat.Png);
                Console.WriteLine("Saved HD Emblem: " + emblemPath + " (" + outW + "x" + outH + ")");
            }

            // 2. Save Native Splash (1242 x 2688)
            int splashW = 1242;
            int splashH = 2688;
            using (Bitmap splash = new Bitmap(splashW, splashH, PixelFormat.Format32bppArgb))
            using (Graphics g = Graphics.FromImage(splash)) {
                g.SmoothingMode = SmoothingMode.AntiAlias;
                g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                g.TextRenderingHint = System.Drawing.Text.TextRenderingHint.AntiAliasGridFit;
                g.PixelOffsetMode = PixelOffsetMode.HighQuality;
                g.Clear(Color.FromArgb(255, 18, 18, 20)); // Obsidian #121214

                // Emblem centered, width = 520
                float embW = 520f;
                float embH = embW * ((float)cropH / cropW);
                float embX = (splashW - embW) / 2f;
                float embY = (splashH / 2f) - embH - 40f;

                g.DrawImage(raw, new RectangleF(embX, embY, embW, embH), new RectangleF(minX, minY, cropW, cropH), GraphicsUnit.Pixel);

                // "getphysical" typography
                using (Font fontTitle = new Font("Arial", 62f, FontStyle.Bold | FontStyle.Italic, GraphicsUnit.Pixel))
                using (Brush brushWhite = new SolidBrush(Color.White)) {
                    string title = "getphysical";
                    SizeF titleSize = g.MeasureString(title, fontTitle);
                    float titleX = (splashW - titleSize.Width) / 2f;
                    float titleY = embY + embH + 34f;
                    g.DrawString(title, fontTitle, brushWhite, titleX, titleY);

                    // "Welcome to GetPhysical"
                    using (Font fontSub = new Font("Arial", 30f, FontStyle.Regular, GraphicsUnit.Pixel))
                    using (Brush brushGray = new SolidBrush(Color.FromArgb(255, 142, 142, 147))) {
                        string sub = "Welcome to GetPhysical";
                        SizeF subSize = g.MeasureString(sub, fontSub);
                        float subX = (splashW - subSize.Width) / 2f;
                        float subY = titleY + titleSize.Height + 10f;
                        g.DrawString(sub, fontSub, brushGray, subX, subY);
                    }
                }

                splash.Save(fullSplashPath, ImageFormat.Png);
                Console.WriteLine("Saved Native Splash: " + fullSplashPath + " (" + splashW + "x" + splashH + ")");
            }
        }
    }
}
