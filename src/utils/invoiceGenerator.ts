import React from 'react';
import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import { OrderProps } from '@/components/orders/OrderCard';
import InvoiceTemplate from '@/components/admin/orders/InvoiceTemplate';

/**
 * Extracts and formats the full, proper customer address into clean lines.
 * Accurately extracts street, apartment/building, landmark, area, city, district/state, and postal code.
 */
export function getFormattedCustomerAddress(shippingAddress: any): string[] {
    if (!shippingAddress) return [];
    if (typeof shippingAddress === 'string') {
        const trimmed = shippingAddress.trim();
        return trimmed ? [trimmed] : [];
    }

    const details = shippingAddress.addressDetails || (typeof shippingAddress === 'object' ? shippingAddress : {});

    // 1. Street and house/apartment
    const streetParts = [
        details.address_line_1 || shippingAddress.address_line_1,
        details.street || shippingAddress.street,
        details.address_line_2 || shippingAddress.address_line_2,
        details.address || shippingAddress.address,
    ].filter(Boolean) as string[];

    // 2. Area & landmark
    const landmark = details.landmark || shippingAddress.landmark;
    const area = details.area || shippingAddress.area;
    const areaParts = [
        landmark ? `Near ${landmark}` : null,
        area,
    ].filter(Boolean) as string[];

    // 3. City, District, State, Postal Code
    const city = details.city || shippingAddress.city || '';
    const district = details.district || shippingAddress.district || '';
    const state = details.state || shippingAddress.state || '';
    const pincode = details.pincode || details.postal_code || shippingAddress.pincode || shippingAddress.postal_code || '';

    // Collect all parts in logical order
    const rawParts: string[] = [
        ...streetParts,
        ...areaParts,
        city,
        (district && district.toLowerCase() !== city.toLowerCase()) ? district : null,
        (state && state.toLowerCase() !== city.toLowerCase() && state.toLowerCase() !== district.toLowerCase()) ? state : null,
        pincode ? pincode : null,
    ].filter(Boolean) as string[];

    // Deduplicate while preserving order (case-insensitive)
    const uniqueParts: string[] = [];
    rawParts.forEach(part => {
        const trimmed = String(part).trim();
        if (!trimmed) return;
        const lower = trimmed.toLowerCase();
        const alreadyIncluded = uniqueParts.some(
            existing => existing.toLowerCase() === lower || existing.toLowerCase().includes(lower)
        );
        if (!alreadyIncluded) {
            uniqueParts.push(trimmed);
        }
    });

    if (uniqueParts.length === 0) return [];

    if (uniqueParts.length <= 2) {
        return [uniqueParts.join(', ')];
    }

    // Split into 2 balanced lines: (e.g. Street/Area, then City/Region)
    const midPoint = Math.ceil(uniqueParts.length / 2);
    const line1 = uniqueParts.slice(0, midPoint).join(', ');
    const line2 = uniqueParts.slice(midPoint).join(', ');
    return [line1, line2].filter(Boolean);
}

/**
 * Generates an invoice PDF with or without PAN and opens it in a new tab.
 */
export async function generateAndOpenInvoice(order: OrderProps, withPan: boolean): Promise<void> {
    const orderIdentifier = order.shortId || (order.id ? order.id.slice(0, 8).toUpperCase() : 'ORDER');

    // 1. Pre-open tab synchronously within user event handler to prevent popup blocker
    let printTab: Window | null = null;
    try {
        printTab = window.open('', '_blank');
        if (printTab) {
            printTab.document.write(`
                <!DOCTYPE html>
                <html>
                    <head>
                        <meta charset="utf-8">
                        <title>Generating Invoice #${orderIdentifier}...</title>
                        <style>
                            body {
                                margin: 0;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                height: 100vh;
                                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                                background-color: #fafafa;
                                color: #18181b;
                            }
                            .card {
                                text-align: center;
                                padding: 36px 48px;
                                background: white;
                                border: 1px solid #e4e4e7;
                                border-radius: 14px;
                                box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
                            }
                            .spinner {
                                width: 36px;
                                height: 36px;
                                border: 3px solid #e4e4e7;
                                border-top-color: #18181b;
                                border-radius: 50%;
                                animation: spin 0.8s linear infinite;
                                margin: 0 auto 16px;
                            }
                            @keyframes spin { to { transform: rotate(360deg); } }
                            h2 { margin: 0 0 6px; font-size: 17px; font-weight: 600; }
                            p { margin: 0; font-size: 13px; color: #71717a; }
                            .badge {
                                display: inline-block;
                                margin-top: 10px;
                                padding: 3px 8px;
                                background: ${withPan ? '#eff6ff' : '#f4f4f5'};
                                color: ${withPan ? '#1d4ed8' : '#52525b'};
                                font-size: 11px;
                                font-weight: 600;
                                border-radius: 6px;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="card">
                            <div class="spinner"></div>
                            <h2>Generating Invoice...</h2>
                            <p>Order #${orderIdentifier}</p>
                            <span class="badge">${withPan ? 'Invoice with PAN (623440377)' : 'Invoice without PAN'}</span>
                        </div>
                    </body>
                </html>
            `);
        }
    } catch (e) {
        console.warn('Could not pre-open window tab:', e);
    }

    // 2. Off-screen DOM rendering container
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '794px';
    container.style.minHeight = '1123px';
    container.style.opacity = '1';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '-99999';
    document.body.appendChild(container);

    const root = createRoot(container);

    try {
        await new Promise<void>((resolve) => {
            root.render(
                React.createElement(InvoiceTemplate, {
                    order,
                    withPan
                })
            );
            // Allow CSS layout and images to paint
            setTimeout(resolve, 350);
        });

        const targetEl = (container.firstElementChild as HTMLElement) || container;

        const canvas = await html2canvas(targetEl, {
            scale: 2.5,
            useCORS: true,
            logging: false,
            width: 794,
            height: 1123,
            windowWidth: 794,
            windowHeight: 1123,
            backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

        const pdfBlobUrl = String(pdf.output('bloburl'));

        if (printTab && !printTab.closed) {
            printTab.location.href = pdfBlobUrl;
        } else {
            window.open(pdfBlobUrl, '_blank');
        }
    } catch (error) {
        console.error('Invoice generation failed:', error);
        if (printTab && !printTab.closed) {
            printTab.close();
        }
        throw error;
    } finally {
        setTimeout(() => {
            try {
                root.unmount();
                if (container.parentNode) {
                    container.parentNode.removeChild(container);
                }
            } catch (e) {
                // Ignore cleanup error
            }
        }, 500);
    }
}
