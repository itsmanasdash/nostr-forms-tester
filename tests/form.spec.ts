import { test, expect, Page, Locator } from '@playwright/test';

const formURL = 'http://localhost:3000/f/naddr1qvzqqqr4mqpzpuje2ntl63kvmh6rykg5j39gmkgr7zmp0exwx8m08vhqn4ckuxklqy2hwumn8ghj7un9d3shjtnyv9kh2uewd9hj7qghwaehxw309aex2mrp0yh8qunfd4skctnwv46z7qgdwaehxw309ahx7uewd3hkcqg7waehxw309aex2mrp0yhxummnw3ezuamfwfjkgmn9wshx5up0qyw8wumn8ghj7mn0wd68ytfsxyh8jcttd95x7mnwv5hxxmmdqyv8wumn8ghj7un9d3shjtnndehhyapwwdhkx6tpdsq3vamnwvaz7tmjv4kxz7fwdehhxarj9e3xzmnyqyghwumn8ghj7mn0wd68yv339e3k7mgqqccnysjswdrqzakn8j?viewKey=9984845c95a1cb4b93b38ca192d4af4fb5fd4858d2583581c70772d267ffe2df';

test.describe('Form Submission Tests Using Correct data-testid Structure', () => {
  test('Complete form submission with all input types', async ({ page }) => {
    test.setTimeout(120000); 

    await page.goto(formURL);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid*="form-fields:question-"]', { timeout: 30000 });
    console.log('Form loaded successfully');

    await handleAllInputTypes(page);
    await submitForm(page);
    await verifySubmissionSuccess(page);
  });

  test('Form submission with required fields only', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto(formURL);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid*="form-fields:question-"]', { timeout: 30000 });
    
    await fillRequiredFieldsOnly(page);
    await submitForm(page);
    await verifySubmissionSuccess(page);
  });
});

async function handleAllInputTypes(page: Page): Promise<void> {
  console.log('Handling all input types using correct data-testid structure...');
  
  // Get all form items (which contain the actual questions)
  const formItems: Locator[] = await page.locator('[data-testid*="form-fields:form-item-"]').all();
  
  for (const formItem of formItems) {
    const formItemTestId: string = await formItem.getAttribute('data-testid') || '';
    // Extract fieldId from form-item testId: "form-fields:form-item-{fieldId}" -> fieldId
    const fieldId = formItemTestId.replace('form-fields:form-item-', '');
    console.log(`Processing question with fieldId: ${fieldId}`);
    
    // Check if required by looking for the required asterisk span
    const isRequired: boolean = await formItem.locator('span[style*="color: #ea8dea"]').count() > 0;
    
    await handleQuestionInputByFieldId(page, fieldId, isRequired);
  }
}

async function handleQuestionInputByFieldId(page: Page, fieldId: string, isRequired: boolean): Promise<void> {
  try {
    const questionTestId = `form-fields:question-${fieldId}`;
    const inputTestId = `${questionTestId}:input`;

    // 1. Text inputs (short text)
    const textInput = page.locator(`[data-testid="${inputTestId}:text-input"]`);
    if (await textInput.count() > 0) {
      const placeholder = await textInput.getAttribute('placeholder') || '';
      const value = placeholder.toLowerCase().includes('email') || fieldId.toLowerCase().includes('email') 
        ? 'test@example.com' 
        : `Test input for ${fieldId}`;
      
      await textInput.fill(value);
      console.log(`✓ Filled text input for field ${fieldId}`);
      return;
    }

    // 2. Textarea (paragraph)
    const textarea = page.locator(`[data-testid="${inputTestId}:text-area"]`);
    if (await textarea.count() > 0) {
      await textarea.fill('This is a sample long answer for paragraph text. It contains multiple sentences to test the textarea functionality.');
      console.log(`✓ Filled textarea for field ${fieldId}`);
      return;
    }

    // 3. Number inputs
    const numberInput = page.locator(`[data-testid="${inputTestId}:number-input"]`);
    if (await numberInput.count() > 0) {
      const inputField = numberInput.locator('input');
      await inputField.fill('42');
      console.log(`✓ Filled number input for field ${fieldId}`);
      return;
    }

    // 4. Radio buttons
    const radioGroup = page.locator(`[data-testid="${inputTestId}:radio:group"]`);
    if (await radioGroup.count() > 0) {
      const firstRadioOption = radioGroup.locator('.ant-radio').first();
      if (await firstRadioOption.count() > 0) {
        await firstRadioOption.click();
        console.log(`✓ Selected radio option for field ${fieldId}`);
        return;
      }
    }

    // 5. Checkboxes
    const checkboxGroup = page.locator(`[data-testid="${inputTestId}:checkboxes:group"]`);
    if (await checkboxGroup.count() > 0) {
      const firstCheckboxOption = checkboxGroup.locator('.ant-checkbox').first();
      if (await firstCheckboxOption.count() > 0) {
        await firstCheckboxOption.click();
        console.log(`✓ Selected checkbox option for field ${fieldId}`);
        return;
      }
    }

    // 6. Dropdown/Select
    const dropdown = page.locator(`[data-testid="${inputTestId}:dropdown:select"]`);
    if (await dropdown.count() > 0) {
      await dropdown.click();
      await page.waitForTimeout(500);
      
      // Wait for dropdown options to appear
      await page.waitForSelector('.ant-select-dropdown .ant-select-item-option', { timeout: 5000 });
      
      const options = await page.locator('.ant-select-dropdown .ant-select-item-option').all();
      if (options.length > 0) {
        await options[0].click();
        console.log(`✓ Selected dropdown option for field ${fieldId}`);
        return;
      }
    }

    // 7. Date picker
    const datePicker = page.locator(`[data-testid="${inputTestId}:date:picker"]`);
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

    // 8. Time picker
    const timePicker = page.locator(`[data-testid="${inputTestId}:time:picker"]`);
    if (await timePicker.count() > 0) {
      await timePicker.click();
      await page.waitForTimeout(500);
      
      // Wait for time panel
      await page.waitForSelector('.ant-picker-time-panel', { timeout: 5000 });
      
      // Select first available time option for hour
      const hourCell = page.locator('.ant-picker-time-panel-column:first-child .ant-picker-time-panel-cell').first();
      if (await hourCell.count() > 0) {
        await hourCell.click();
        
        // Select first available time option for minute
        const minuteCell = page.locator('.ant-picker-time-panel-column:nth-child(2) .ant-picker-time-panel-cell').first();
        if (await minuteCell.count() > 0) {
          await minuteCell.click();
        }
        
        // Click OK button if present
        const okButton = page.locator('.ant-picker-ok button');
        if (await okButton.count() > 0) {
          await okButton.click();
        }
        
        console.log(`✓ Selected time for field ${fieldId}`);
        return;
      }
    }

    // 9. Handle "other" input in choice fillers
    const otherInput = page.locator(`[data-testid*="${inputTestId}"][data-testid*="other-input"]`);
    if (await otherInput.count() > 0) {
      await otherInput.fill('Other response text');
      console.log(`✓ Filled other input for field ${fieldId}`);
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
  console.log('Filling only required fields using correct data-testid structure...');
  
  const formItems: Locator[] = await page.locator('[data-testid*="form-fields:form-item-"]').all();
  
  for (const formItem of formItems) {
    const formItemTestId: string = await formItem.getAttribute('data-testid') || '';
    const fieldId = formItemTestId.replace('form-fields:form-item-', '');
    
    const isRequired: boolean = await formItem.locator('span[style*="color: #ea8dea"]').count() > 0;
    
    if (isRequired) {
      console.log(`Filling required field ${fieldId}`);
      await handleQuestionInputByFieldId(page, fieldId, true);
    } else {
      console.log(`Skipping non-required field ${fieldId}`);
    }
  }
}

async function submitForm(page: Page): Promise<void> {
  console.log('Submitting form...');
  
  const submitButton: Locator = page.locator('[data-testid="submit-button"]');
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
      const element: Locator = page.locator(selector).first();
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