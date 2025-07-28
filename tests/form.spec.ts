import { test, expect, Page, Locator } from '@playwright/test';

const formURL = 'http://localhost:3000/f/naddr1qvzqqqr4mqpzqfn4ghz9fzsmxjretw4fesdeaax30zcf8pck3q6tg5ffgj2g4ak8qy2hwumn8ghj7un9d3shjtnyv9kh2uewd9hj7qghwaehxw309aex2mrp0yh8qunfd4skctnwv46z7qgdwaehxw309ahx7uewd3hkcqg7waehxw309aex2mrp0yhxummnw3ezuamfwfjkgmn9wshx5up0qyw8wumn8ghj7mn0wd68ytfsxyh8jcttd95x7mnwv5hxxmmdqyv8wumn8ghj7un9d3shjtnndehhyapwwdhkx6tpdsq3vamnwvaz7tmjv4kxz7fwdehhxarj9e3xzmnyqyghwumn8ghj7mn0wd68yv339e3k7mgqqeuy75j0wyes4r93t6?viewKey=b42c156e04f0b3aba7714dfcb90bef63ace49a3fc924b6926d266ea5cd638828';

test.describe('Form Submission Behavioral Tests', () => {
  test('Complete form submission with all input types', async ({ page }) => {
    test.setTimeout(120000); 

    await page.goto(formURL);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('form', { timeout: 30000 });

    console.log('Form loaded successfully');

    await handleAllInputTypes(page);
    await submitForm(page);
    await verifySubmissionSuccess(page);
  });

  test('Form submission with required fields only', async ({ page }) => {
    test.setTimeout(120000);

    
    await page.goto(formURL);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('form', { timeout: 30000 });

    await fillRequiredFieldsOnly(page);
    await submitForm(page);
    await verifySubmissionSuccess(page);
  });

  test('Form validation - missing required fields', async ({ page }) => {
    test.setTimeout(120000);
  

    await page.goto(formURL);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('form', { timeout: 30000 });
  
    const requiredFields: Locator[] = await page.locator('.ant-form-item-required').all();
    const hasRequiredFields: boolean = requiredFields.length > 0;
    
    console.log(`Found ${requiredFields.length} required fields`);
  
    await submitForm(page);
  
    if (hasRequiredFields) {
      console.log('Form has required fields - checking for validation errors');
      
      await page.waitForTimeout(1000);
      
      const errorMessages: Locator[] = await page.locator('.ant-form-item-explain-error').all();
      expect(errorMessages.length).toBeGreaterThan(0);
      
      console.log(`Found ${errorMessages.length} validation errors as expected`);
    } else {
      console.log('Form has no required fields - verifying successful submission');
      
      await verifySubmissionSuccess(page);
      console.log('Form submitted successfully (no required fields)');
    }
  });
});

async function handleAllInputTypes(page: Page): Promise<void> {
  console.log('Handling all input types...');

  await handleTextInputs(page);
  await handleTextareas(page);
  await handleNumberInputs(page);
  await handleRadioButtons(page);
  await handleCheckboxes(page);
  await handleDropdowns(page);
  await handleDateInputs(page);
  await handleTimeInputs(page);
}

async function handleTextInputs(page: Page): Promise<void> {
  const textInputs: Locator[] = await page.locator('input[type="text"], input[type="email"], input:not([type])').all();
  
  for (const input of textInputs) {
    const type: string | null = await input.getAttribute('type');
    const placeholder: string = await input.getAttribute('placeholder') || '';
    const isEmail: boolean = type === 'email' || placeholder.toLowerCase().includes('email');
    
    if (isEmail) {
      await input.fill('test@example.com');
    } else {
      await input.fill(`Test ${placeholder || 'field'}`);
    }
    
    console.log(`Filled text input: ${type || 'text'}`);
  }
}

async function handleTextareas(page: Page): Promise<void> {
  const textareas: Locator[] = await page.locator('textarea').all();
  
  for (const textarea of textareas) {
    await textarea.fill('This is a sample long answer for paragraph text. It contains multiple sentences to test the textarea functionality.');
    console.log('Filled textarea');
  }
}

async function handleNumberInputs(page: Page): Promise<void> {
  const numberInputs: Locator[] = await page.locator('input[type="number"], .ant-input-number input').all();
  
  for (const input of numberInputs) {
    await input.fill('42');
    console.log('Filled number input');
  }
}

async function handleRadioButtons(page: Page): Promise<void> {
  const radioGroups: Locator[] = await page.locator('.ant-radio-group').all();
  
  for (const group of radioGroups) {
    const firstRadio: Locator = await group.locator('.ant-radio').first();
    await firstRadio.click();
    console.log('Selected first radio button option');
  }
}

async function handleCheckboxes(page: Page): Promise<void> {
  const checkboxGroups: Locator[] = await page.locator('.ant-checkbox-group').all();
  
  for (const group of checkboxGroups) {
    const checkboxes: Locator[] = await group.locator('.ant-checkbox').all();
    for (let i = 0; i < Math.min(2, checkboxes.length); i++) {
      await checkboxes[i].click();
    }
    console.log(`Selected ${Math.min(2, checkboxes.length)} checkbox options`);
  }
}

async function handleDropdowns(page: Page): Promise<void> {
  const dropdowns: Locator[] = await page.locator('.ant-select').all();
  
  for (const dropdown of dropdowns) {
    await dropdown.click();
    await page.waitForTimeout(500);
    
    const options: Locator[] = await page.locator('.ant-select-dropdown .ant-select-item').all();
    if (options.length > 1) {
      await options[1].click();
      console.log('Selected dropdown option');
    }
  }
}

async function handleDateInputs(page: Page): Promise<void> {
  const dateInputs: Locator[] = await page.locator('input[type="date"], .ant-picker-input input').all();
  
  for (const input of dateInputs) {
    const type: string | null = await input.getAttribute('type');
    if (type === 'date') {
      await input.fill('2025-01-15');
    } else {
      await input.click();
      await page.waitForTimeout(500);
      const today: Locator = await page.locator('.ant-picker-cell-today').first();
      await today.click();
    }
    console.log('Filled date input');
  }
}

async function handleTimeInputs(page: Page): Promise<void> {
  const timeInputs: Locator[] = await page.locator('input[type="time"], .ant-picker-time-panel input').all();
  
  for (const input of timeInputs) {
    const type: string | null = await input.getAttribute('type');
    if (type === 'time') {
      await input.fill('14:30');
    } else {
      await input.click();
      await page.waitForTimeout(500);
      const timeOption: Locator = await page.locator('.ant-picker-time-panel-cell').first();
      await timeOption.click();
    }
    console.log('Filled time input');
  }
}

async function fillRequiredFieldsOnly(page: Page): Promise<void> {
  console.log('Filling only required fields...');
  
  const requiredFields: Locator[] = await page.locator('.ant-form-item-required').all();
  
  for (const field of requiredFields) {
    const parent: Locator = await field.locator('..');
    const input: Locator = await parent.locator('input, textarea, .ant-select, .ant-radio-group, .ant-checkbox-group').first();
    
    if (await input.count() > 0) {
      const tagName: string = await input.evaluate(el => el.tagName.toLowerCase());
      
      if (tagName === 'input') {
        const type: string | null = await input.getAttribute('type');
        if (type === 'email') {
          await input.fill('test@example.com');
        } else if (type === 'number') {
          await input.fill('42');
        } else {
          await input.fill('Required field value');
        }
      } else if (tagName === 'textarea') {
        await input.fill('Required paragraph text');
      } else if (await input.evaluate(el => el.classList.contains('ant-select'))) {
        await input.click();
        await page.waitForTimeout(500);
        const option: Locator = await page.locator('.ant-select-dropdown .ant-select-item').first();
        await option.click();
      } else if (await input.evaluate(el => el.classList.contains('ant-radio-group'))) {
        const radio: Locator = await input.locator('.ant-radio').first();
        await radio.click();
      } else if (await input.evaluate(el => el.classList.contains('ant-checkbox-group'))) {
        const checkbox: Locator = await input.locator('.ant-checkbox').first();
        await checkbox.click();
      }
      
      console.log('Filled required field');
    }
  }
}

async function submitForm(page: Page): Promise<void> {
  console.log('Submitting form...');
  
  const submitSelectors: string[] = [
    '.submit-button',
    'button[type="submit"]',
    'button:has-text("Submit")',
    '.ant-btn-primary:has-text("Submit")',
    '.ant-dropdown-button .ant-btn-primary'
  ];
  
  let submitted: boolean = false;
  
  for (const selector of submitSelectors) {
    try {
      const submitButton: Locator = await page.locator(selector).first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        submitted = true;
        console.log(`Form submitted using selector: ${selector}`);
        break;
      }
    } catch (error) {
      console.log(`Submit button not found with selector: ${selector}`);
    }
  }
  
  if (!submitted) {
    throw new Error('Submit button not found with any selector');
  }
  
  await page.waitForTimeout(3000);
}

async function verifySubmissionSuccess(page: Page): Promise<void> {
  console.log('Verifying submission success...');
  
  const successSelectors: string[] = [
    '.ant-modal-content img[alt="Thank you"]',
    'text=/thank you/i',
    'text=/response received/i',
    'text=/submitted/i',
    'text=/success/i',
    '.embed-submitted',
    '.ant-modal'
  ];
  
  let successFound: boolean = false;
  
  for (const selector of successSelectors) {
    try {
      const element: Locator = await page.locator(selector).first();
      if (await element.isVisible({ timeout: 5000 })) {
        successFound = true;
        console.log(`Success indicator found: ${selector}`);
        break;
      }
    } catch (error) {
      // Continue to next selector
    }
  }
  
  if (!successFound) {
    const currentUrl: string = page.url();
    console.log(`Current URL after submission: ${currentUrl}\n`);
    
    const pageContent: string = await page.content();
    if (pageContent.includes('thank') || pageContent.includes('success') || pageContent.includes('submitted')) {
      successFound = true;
      console.log('Success indicator found in page content\n');
    }
  }
  
  expect(successFound).toBe(true);
  console.log('Form submission verified successfully!\n');
}