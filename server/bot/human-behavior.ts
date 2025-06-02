import { Page } from 'puppeteer';

export class HumanBehavior {
  /**
   * Simulates human-like mouse movement using bezier curves
   */
  async moveMouseInHumanPattern(
    page: Page,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    steps = 10
  ): Promise<void> {
    const bezierPoints = this.generateBezierCurve(startX, startY, endX, endY);
    
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const point = this.getPointOnCurve(bezierPoints, t);
      await page.mouse.move(point.x, point.y);
      await this.randomDelay(5, 15); // Tiny delays between movements
    }
  }

  /**
   * Simulates human-like typing with variable speed and occasional mistakes
   */
  async typeHumanly(page: Page, selector: string, text: string): Promise<void> {
    await page.waitForSelector(selector);
    await page.focus(selector);

    for (let i = 0; i < text.length; i++) {
      // Random typing speed between 100ms and 300ms
      await this.randomDelay(100, 300);

      // Occasionally simulate a typo (1% chance)
      if (Math.random() < 0.01) {
        const typo = this.getRandomChar();
        await page.keyboard.type(typo);
        await this.randomDelay(500, 1000); // Pause before correction
        await page.keyboard.press('Backspace');
        await this.randomDelay(200, 400);
      }

      await page.keyboard.type(text[i]);
    }
  }

  /**
   * Simulates natural scrolling behavior
   */
  async scrollNaturally(page: Page, distance: number): Promise<void> {
    const steps = Math.abs(Math.floor(distance / 100));
    const direction = distance > 0 ? 1 : -1;

    for (let i = 0; i < steps; i++) {
      const stepSize = direction * (100 + Math.random() * 50 - 25); // Random variation in step size
      await page.evaluate((y) => window.scrollBy(0, y), stepSize);
      await this.randomDelay(100, 300);

      // Occasionally pause scrolling (5% chance)
      if (Math.random() < 0.05) {
        await this.randomDelay(500, 1500);
      }
    }
  }

  /**
   * Simulates human-like clicking behavior
   */
  async clickHumanly(page: Page, selector: string): Promise<void> {
    await page.waitForSelector(selector);
    
    const element = await page.$(selector);
    if (!element) return;

    const box = await element.boundingBox();
    if (!box) return;

    // Move to element with human-like motion
    const targetX = box.x + box.width / 2 + (Math.random() * 10 - 5);
    const targetY = box.y + box.height / 2 + (Math.random() * 10 - 5);

    await this.moveMouseInHumanPattern(
      page,
      box.x + box.width / 2,
      box.y + box.height / 2,
      targetX,
      targetY
    );

    // Slight delay before clicking (150-300ms)
    await this.randomDelay(150, 300);
    
    await element.click();
  }

  /**
   * Simulates natural page navigation behavior
   */
  async navigateNaturally(page: Page, url: string): Promise<void> {
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    // Random initial pause to simulate page scanning
    await this.randomDelay(1000, 3000);

    // Simulate random mouse movements
    for (let i = 0; i < 3; i++) {
      const randomX = Math.floor(Math.random() * page.viewport()!.width);
      const randomY = Math.floor(Math.random() * page.viewport()!.height);
      
      await this.moveMouseInHumanPattern(
        page,
        page.viewport()!.width / 2,
        page.viewport()!.height / 2,
        randomX,
        randomY
      );
      
      await this.randomDelay(500, 1500);
    }
  }

  /**
   * Generates random but human-like delays
   */
  async randomDelay(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min) + min);
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Generates points for a bezier curve to simulate natural mouse movement
   */
  private generateBezierCurve(startX: number, startY: number, endX: number, endY: number) {
    const midX = startX + (endX - startX) / 2;
    const midY = startY + (endY - startY) / 2;
    
    // Add some randomness to control points
    const ctrl1X = midX + (Math.random() * 100 - 50);
    const ctrl1Y = startY + (Math.random() * 100 - 50);
    const ctrl2X = midX + (Math.random() * 100 - 50);
    const ctrl2Y = endY + (Math.random() * 100 - 50);

    return [
      { x: startX, y: startY },
      { x: ctrl1X, y: ctrl1Y },
      { x: ctrl2X, y: ctrl2Y },
      { x: endX, y: endY }
    ];
  }

  /**
   * Calculates a point on a bezier curve
   */
  private getPointOnCurve(points: Array<{x: number, y: number}>, t: number) {
    const [p0, p1, p2, p3] = points;
    const cx = 3 * (p1.x - p0.x);
    const bx = 3 * (p2.x - p1.x) - cx;
    const ax = p3.x - p0.x - cx - bx;
    const cy = 3 * (p1.y - p0.y);
    const by = 3 * (p2.y - p1.y) - cy;
    const ay = p3.y - p0.y - cy - by;

    const t2 = t * t;
    const t3 = t2 * t;

    return {
      x: ax * t3 + bx * t2 + cx * t + p0.x,
      y: ay * t3 + by * t2 + cy * t + p0.y
    };
  }

  /**
   * Returns a random character for typo simulation
   */
  private getRandomChar(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    return chars[Math.floor(Math.random() * chars.length)];
  }
}
