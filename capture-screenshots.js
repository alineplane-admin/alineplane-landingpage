const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  
  // Desktop screenshots (1440px width)
  console.log('Capturing desktop screenshots (1440px)...');
  const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desktopPage.goto('http://localhost:8080');
  await desktopPage.waitForLoadState('networkidle');
  await desktopPage.waitForTimeout(1000); // Wait for animations

  // Hero
  await desktopPage.screenshot({ path: 'screenshot-desktop-hero.png', fullPage: false });
  console.log('✓ Desktop hero screenshot saved');

  // Open staggered menu
  await desktopPage.click('.menu-toggle');
  await desktopPage.waitForSelector('.staggered-menu.is-open', { timeout: 2000 });
  await desktopPage.waitForTimeout(1200); // Wait for staggered animation to complete
  await desktopPage.screenshot({ path: 'screenshot-desktop-menu.png', fullPage: false });
  console.log('✓ Desktop menu screenshot saved');

  // Close menu and scroll to states section
  await desktopPage.keyboard.press('Escape');
  await desktopPage.waitForTimeout(500);
  await desktopPage.evaluate(() => {
    document.getElementById('states').scrollIntoView({ behavior: 'smooth' });
  });
  await desktopPage.waitForTimeout(1500);
  await desktopPage.screenshot({ path: 'screenshot-desktop-states.png', clip: { x: 0, y: 0, width: 1440, height: 900 } });
  console.log('✓ Desktop states section screenshot saved');

  await desktopPage.close();

  // Mobile screenshots (390px width)
  console.log('\nCapturing mobile screenshots (390px)...');
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto('http://localhost:8080');
  await mobilePage.waitForLoadState('networkidle');
  await mobilePage.waitForTimeout(1000);

  // Hero
  await mobilePage.screenshot({ path: 'screenshot-mobile-hero.png', fullPage: false });
  console.log('✓ Mobile hero screenshot saved');

  // Open staggered menu
  await mobilePage.click('.menu-toggle');
  await mobilePage.waitForSelector('.staggered-menu.is-open', { timeout: 2000 });
  await mobilePage.waitForTimeout(1200);
  await mobilePage.screenshot({ path: 'screenshot-mobile-menu.png', fullPage: false });
  console.log('✓ Mobile menu screenshot saved');

  // Close menu and scroll to states section
  await mobilePage.keyboard.press('Escape');
  await mobilePage.waitForTimeout(500);
  await mobilePage.evaluate(() => {
    document.getElementById('states').scrollIntoView({ behavior: 'smooth' });
  });
  await mobilePage.waitForTimeout(1500);
  await mobilePage.screenshot({ path: 'screenshot-mobile-states.png', clip: { x: 0, y: 0, width: 390, height: 844 } });
  console.log('✓ Mobile states section screenshot saved');

  await mobilePage.close();
  await browser.close();

  console.log('\nAll screenshots captured successfully!');
  process.exit(0);
})();
