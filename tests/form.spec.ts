import { test, expect, Page, Locator } from '@playwright/test';

const formURL = 'http://localhost:3000/f/naddr1qvzqqqr4mqpzpuje2ntl63kvmh6rykg5j39gmkgr7zmp0exwx8m08vhqn4ckuxklqy2hwumn8ghj7un9d3shjtnyv9kh2uewd9hj7qghwaehxw309aex2mrp0yh8qunfd4skctnwv46z7qgdwaehxw309ahx7uewd3hkcqg7waehxw309aex2mrp0yhxummnw3ezuamfwfjkgmn9wshx5up0qyw8wumn8ghj7mn0wd68ytfsxyh8jcttd95x7mnwv5hxxmmdqyv8wumn8ghj7un9d3shjtnndehhyapwwdhkx6tpdsq3vamnwvaz7tmjv4kxz7fwdehhxarj9e3xzmnyqyghwumn8ghj7mn0wd68yv339e3k7mgqqccnysjswdrqzakn8j?viewKey=9984845c95a1cb4b93b38ca192d4af4fb5fd4858d2583581c70772d267ffe2df';

test.describe('Form Submission Tests Using data-testid', () => {
  test('Complete form submission with all input types', async ({ page }) => {
    test.setTimeout(120000); 

    await page.goto(formURL);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid]', { timeout: 30000 });
    console.log('Form loaded successfully');

    await handleAllInputTypes(page);
    await submitForm(page);
    await verifySubmissionSuccess(page);
  });

  test('Form submission with required fields only', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto(formURL);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid]', { timeout: 30000 });
    
    await fillRequiredFieldsOnly(page);
    await submitForm(page);
    await verifySubmissionSuccess(page);
  });
});

async function handleAllInputTypes(page: Page): Promise<void> {
  console.log('Handling all input types using data-testid...');
  const questionCards: Locator[] = await page.locator('.filler-question[data-testid]').all();
  
  for (const questionCard of questionCards) {
    const fieldId: string = await questionCard.getAttribute('data-testid') || '';
    console.log(`Processing question with fieldId: ${fieldId}`);
    const isRequired: boolean = await questionCard.locator('span[style*="color: #ea8dea"]').count() > 0;
    await handleQuestionInputByTestId(page, fieldId, isRequired);
  }
}

async function handleQuestionInputByTestId(page: Page, fieldId: string, isRequired: boolean): Promise<void> {
  try {

    // 1. Text inputs (short text, email)
    const textInput = page.locator(`input[data-testid="${fieldId}"]`);
    if (await textInput.count() > 0) {
      const placeholder = await textInput.getAttribute('placeholder') || '';
      const isReadonly = await textInput.getAttribute('readonly') !== null;
      
      if (!isReadonly) {
        const isEmail = placeholder.toLowerCase().includes('email') || fieldId.toLowerCase().includes('email');
        const value = isEmail ? 'test@example.com' : `Test input for ${fieldId}`;
        
        await textInput.fill(value);
        console.log(`✓ Filled text input for field ${fieldId}`);
        return;
      }
    }

    // 2. Textarea (paragraph)
    const textarea = page.locator(`textarea[data-testid="${fieldId}"]`);
    if (await textarea.count() > 0) {
      await textarea.fill('This is a sample long answer for paragraph text. It contains multiple sentences to test the textarea functionality.');
      console.log(`✓ Filled textarea for field ${fieldId}`);
      return;
    }

    // 3. Number inputs
    const numberInput = page.locator(`[data-testid="${fieldId}"].ant-input-number`);
    if (await numberInput.count() > 0) {
      const inputField = numberInput.locator('input');
      await inputField.fill('42');
      console.log(`✓ Filled number input for field ${fieldId}`);
      return;
    }

    // 4. Choice inputs (radio/checkbox) - using the Group's data-testid
    const choiceGroup = page.locator(`[data-testid="${fieldId}"]`);
    if (await choiceGroup.count() > 0) {
      // Look for radio or checkbox inputs within the group
      const radioOption = choiceGroup.locator('.ant-radio').first();
      const checkboxOption = choiceGroup.locator('.ant-checkbox').first();
      
      if (await radioOption.count() > 0) {
        await radioOption.click();
        console.log(`✓ Selected radio option for field ${fieldId}`);
        return;
      } else if (await checkboxOption.count() > 0) {
        await checkboxOption.click();
        console.log(`✓ Selected checkbox option for field ${fieldId}`);
        return;
      }
    }

    // 5. Dropdown/Select
    const dropdown = page.locator(`[data-testid="${fieldId}"].ant-select`);
    if (await dropdown.count() > 0) {
      await dropdown.click();
      await page.waitForTimeout(500);
      
      // Wait for dropdown options to appear
      await page.waitForSelector('.ant-select-dropdown .ant-select-item-option', { timeout: 5000 });
      
      const options = await page.locator('.ant-select-dropdown .ant-select-item-option').all();
      if (options.length > 0) {
        // Select the first available option
        await options[0].click();
        console.log(`✓ Selected dropdown option for field ${fieldId}`);
        return;
      }
    }

    // 6. Date picker
    const datePicker = page.locator(`[data-testid="${fieldId}"].ant-picker`);
    if (await datePicker.count() > 0) {
      await datePicker.click();
      await page.waitForTimeout(500);
      
      // Wait for date picker panel
      await page.waitForSelector('.ant-picker-panel', { timeout: 5000 });
      
      const today = page.locator('.ant-picker-cell-today').first();
      if (await today.count() > 0) {
        await today.click();
        console.log(`✓ Selected date for field ${fieldId}`);
        return;
      } else {
        // If no "today" cell, click any available date
        const anyDateCell = page.locator('.ant-picker-cell').first();
        if (await anyDateCell.count() > 0) {
          await anyDateCell.click();
          console.log(`✓ Selected date for field ${fieldId}`);
          return;
        }
      }
    }

    // 7. Time picker
    const timePicker = page.locator(`[data-testid="${fieldId}"].ant-picker`);
    if (await timePicker.count() > 0) {
      // Check if this is specifically a time picker by looking for time-related classes
      const isTimePicker = await timePicker.locator('.ant-picker-input input[placeholder*="time" i], .ant-picker-input input[placeholder*="h:mm" i]').count() > 0;
      
      if (isTimePicker) {
        await timePicker.click();
        await page.waitForTimeout(500);
        
        // Wait for time panel
        await page.waitForSelector('.ant-picker-time-panel', { timeout: 5000 });
        
        // Select first available time option
        const timeCell = page.locator('.ant-picker-time-panel-cell').first();
        if (await timeCell.count() > 0) {
          await timeCell.click();
          
          // Click OK button if present
          const okButton = page.locator('.ant-picker-ok button');
          if (await okButton.count() > 0) {
            await okButton.click();
          }
          
          console.log(`✓ Selected time for field ${fieldId}`);
          return;
        }
      }
    }

    // 8. Fallback for readonly date inputs (alternative date picker implementation)
    const readonlyDateInput = page.locator(`input[readonly][data-testid="${fieldId}"]`);
    if (await readonlyDateInput.count() > 0) {
      const placeholder = await readonlyDateInput.getAttribute('placeholder') || '';
      if (placeholder.toLowerCase().includes('date')) {
        await readonlyDateInput.click();
        await page.waitForTimeout(500);
        
        const today = page.locator('.ant-picker-cell-today').first();
        if (await today.count() > 0) {
          await today.click();
          console.log(`✓ Selected date for readonly input ${fieldId}`);
          return;
        }
      }
    }

    console.log(`⚠ No suitable input found for field ${fieldId}`);
    
  } catch (error) {
    console.error(`❌ Error handling field ${fieldId}:`, error);
    
    await page.screenshot({ path: `debug-field-${fieldId}.png` });
    
    if (isRequired) {
      throw new Error(`Failed to fill required field: ${fieldId}`);
    }
  }
}

async function fillRequiredFieldsOnly(page: Page): Promise<void> {
  console.log('Filling only required fields using data-testid...');
  
  const questionCards: Locator[] = await page.locator('.filler-question[data-testid]').all();
  
  for (const questionCard of questionCards) {
    const fieldId: string = await questionCard.getAttribute('data-testid') || '';
    
    const isRequired: boolean = await questionCard.locator('span[style*="color: #ea8dea"]').count() > 0;
    
    if (isRequired) {
      console.log(`Filling required field ${fieldId}`);
      await handleQuestionInputByTestId(page, fieldId, true);
    } else {
      console.log(`Skipping non-required field ${fieldId}`);
    }
  }
}

async function submitForm(page: Page): Promise<void> {
  console.log('Submitting form...');
  
  const submitButton: Locator = await page.locator('[data-testid="submit-button"]').first();
  if (await submitButton.isVisible()) {
    await submitButton.click();
    console.log('Form submitted using submit button');
  } else {
    throw new Error('Submit button not found');
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
    }
  }
  
  if (!successFound) {
    const currentUrl: string = page.url();
    console.log(`Current URL after submission: ${currentUrl}`);
    
    const pageContent: string = await page.content();
    if (pageContent.includes('thank') || pageContent.includes('success') || pageContent.includes('submitted')) {
      successFound = true;
      console.log('Success indicator found in page content');
    }
  }
  
  expect(successFound).toBe(true);
  console.log('Form submission verified successfully!');
}

// Helper function for better error handling and retries
async function clickWithRetry(locator: Locator, maxRetries: number = 3): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await locator.click();
      return;
    } catch (error) {
      console.log(`Click attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

// Helper function to wait for element and perform action
async function waitAndFill(locator: Locator, value: string, timeout: number = 5000): Promise<void> {
  await expect(locator).toBeVisible({ timeout });
  await locator.fill(value);
}