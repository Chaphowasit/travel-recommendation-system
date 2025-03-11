import * as XLSX from 'xlsx';
import { RouteData } from './DataType/route';
import html2canvas from 'html2canvas';
import ExcelJS from "exceljs";
import { dayjsStartDate, generateDateRange } from './time';

export const export_to_excel = async (
  start_date: Date,
  end_date: Date,
  routeData: RouteData
) => {
  // ---------------------------
  // 1) Date Parsing & Formatting
  // ---------------------------
  const startDateStr = dayjsStartDate(start_date).format("YYYY-MM-DD");
  const endDateStr = dayjsStartDate(end_date).format("YYYY-MM-DD");
  const dateRange = generateDateRange(start_date, end_date);

  const formatDateDay = (dayNum: number) => {
    const date = dateRange[dayNum - 1];
    return date ? `${date}\n(Day ${dayNum})` : `Day ${dayNum}`;
  };

  // ---------------------------
  // 3) Helper: Time Formatting
  // Converts a numeric 15-min index into { day, time: "HH:MM" }
  // ---------------------------
  const formatTime = (timeUnits: number): { day: number; time: string } => {
    const day = Math.floor(timeUnits / 96) + 1;
    const hour = Math.floor(((timeUnits % 96) * 15) / 60);
    const minutes = ((timeUnits % 96) * 15) % 60;
    return {
      day,
      time: `${hour}:${minutes.toString().padStart(2, "0")}`
    };
  };

  // ---------------------------
  // 4) Split Routes into Daily Partial Rows
  // ---------------------------
  type SplitRow = {
    splitGroupId: string;
    dayNumber: number;
    node: string;
    arrival: string;   // "HH:MM"
    departure: string; // "HH:MM"
  };

  let splitRows: SplitRow[] = [];

  // Convert a "HH:MM" formatted time into a number.
  const parseTimeToNumber = (timeStr: string): number => {
    const [hh, mm] = timeStr.split(":").map(Number);
    return hh + mm / 60;
  };

  // Splitting logic for multi-day segments.
  // For multi-day segments:
  // - First day: use actual arrival and "24:00" for departure.
  // - Middle days (if any): "00:00" to "24:00".
  // - Last day: "00:00" to the actual departure.
  const splitRoute = (
    groupId: string,
    arrDay: number,
    arrTime: string,
    depDay: number,
    depTime: string,
    nodeName: string
  ) => {
    if (arrDay === depDay) {
      splitRows.push({
        splitGroupId: groupId,
        dayNumber: arrDay,
        node: nodeName,
        arrival: arrTime,
        departure: depTime
      });
      return;
    }

    // First day: from actual arrival to 24:00.
    splitRows.push({
      splitGroupId: groupId,
      dayNumber: arrDay,
      node: nodeName,
      arrival: arrTime,
      departure: "24:00"
    });

    // Middle days: from 00:00 to 24:00.
    for (let d = arrDay + 1; d < depDay; d++) {
      splitRows.push({
        splitGroupId: groupId,
        dayNumber: d,
        node: nodeName,
        arrival: "00:00",
        departure: "24:00"
      });
    }

    // Last day: from 00:00 to actual departure.
    splitRows.push({
      splitGroupId: groupId,
      dayNumber: depDay,
      node: nodeName,
      arrival: "00:00",
      departure: depTime
    });
  };

  // Build the splitRows array from routeData.
  let groupCounter = 0;
  routeData.routes.forEach((route: any) => {
    route.forEach((node: any, idx: number) => {
      const nodeName = node.node;
      const arrival = formatTime(node.arrival_time);
      let departure = formatTime(node.departure_time);
  
      // If the formatted departure time is "0:00", adjust it to "24:00" on the same day.
      if (departure.time === "0:00") {
        departure = { day: arrival.day, time: "24:00" };
      }
  
      // For the last node in a route, override departure to "24:00"
      if (idx === route.length - 1) {
        departure = { day: arrival.day, time: "24:00" };
      }
      
      const groupId = `route_${groupCounter++}`;
      splitRoute(
        groupId,
        arrival.day,
        arrival.time,
        departure.day,
        departure.time,
        nodeName
      );
    });
  });
  

  // ---------------------------
  // 5) Calculate Stay Time & Group by Day
  // ---------------------------
  type FinalRow = {
    splitGroupId: string;
    node: string;
    arrival: string;
    departure: string;
    stayTime: string;
  };
  const groupedByDay: { [key: number]: FinalRow[] } = {};

  splitRows.forEach((row) => {
    const arrNum = parseTimeToNumber(row.arrival);
    const depNum = parseTimeToNumber(row.departure);
    let stayStr = "";
    if (depNum > arrNum) {
      const totalMinutes = (depNum - arrNum) * 60;
      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;
      stayStr = `${h}h ${m}m`;
    }
    const finalObj: FinalRow = {
      splitGroupId: row.splitGroupId,
      node: row.node,
      arrival: row.arrival,
      departure: row.departure,
      stayTime: stayStr
    };

    if (!groupedByDay[row.dayNumber]) {
      groupedByDay[row.dayNumber] = [];
    }
    groupedByDay[row.dayNumber].push(finalObj);
  });

  // Flatten the grouped rows into a final table array.
  const rows: any[] = [];
  Object.keys(groupedByDay)
    .map(Number)
    .sort((a, b) => a - b)
    .forEach((day) => {
      groupedByDay[day].forEach((entry, idx) => {
        rows.push({
          Day: idx === 0 ? formatDateDay(day) : "",
          splitGroupId: entry.splitGroupId,
          Node: entry.node,
          "Arrival Time": entry.arrival,
          "Departure Time": entry.departure,
          "Stay/Sleep Time": entry.stayTime
        });
      });
    });

  // ---------------------------
  // 6) Build Merge Ranges for Excel Cells
  // ---------------------------
  const mergeRanges: any[] = [];
  const headerOffset = 6; // 5 header rows + 1 table header row

  // Merge "Day" column cells across rows of the same day.
  let dayGroupStart: number | null = null;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].Day !== "") {
      if (dayGroupStart !== null && i - dayGroupStart > 1) {
        mergeRanges.push({
          s: { r: dayGroupStart + headerOffset, c: 0 },
          e: { r: i - 1 + headerOffset, c: 0 },
          type: "day"
        });
      }
      dayGroupStart = i;
    }
  }
  if (dayGroupStart !== null && rows.length - dayGroupStart > 1) {
    mergeRanges.push({
      s: { r: dayGroupStart + headerOffset, c: 0 },
      e: { r: rows.length - 1 + headerOffset, c: 0 },
      type: "day"
    });
  }

  // Merge cells for consecutive rows with the same splitGroupId.
  let groupStartIdx = 0;
  let currentGroupId = rows[0].splitGroupId;
  for (let i = 0; i < rows.length; i++) {
    const isLastRow = i === rows.length - 1;
    if (isLastRow || rows[i + 1].splitGroupId !== currentGroupId) {
      if (i - groupStartIdx >= 1) {
        // Merge Node (column index 1)
        mergeRanges.push({
          s: { r: groupStartIdx + headerOffset, c: 1 },
          e: { r: i + headerOffset, c: 1 },
          type: "node"
        });
        // Merge Arrival Time (column index 2)
        mergeRanges.push({
          s: { r: groupStartIdx + headerOffset, c: 2 },
          e: { r: i + headerOffset, c: 2 },
          type: "arrival"
        });
        // Merge Departure Time (column index 3)
        mergeRanges.push({
          s: { r: groupStartIdx + headerOffset, c: 3 },
          e: { r: i + headerOffset, c: 3 },
          type: "departure",
          lastRow: i
        });
        // Merge Stay/Sleep Time (column index 4) and sum durations.
        let totalMinutes = 0;
        for (let j = groupStartIdx; j <= i; j++) {
          const regex = /(\d+)h\s*(\d+)m/;
          const match = rows[j]["Stay/Sleep Time"].match(regex);
          if (match) {
            const hours = parseInt(match[1], 10);
            const minutes = parseInt(match[2], 10);
            totalMinutes += hours * 60 + minutes;
          }
        }
        mergeRanges.push({
          s: { r: groupStartIdx + headerOffset, c: 4 },
          e: { r: i + headerOffset, c: 4 },
          type: "stay",
          totalMinutes
        });
      }
      if (!isLastRow) {
        groupStartIdx = i + 1;
        currentGroupId = rows[i + 1].splitGroupId;
      }
    }
  }

  // ---------------------------
  // 7) Build Final Excel Data Array
  // ---------------------------
  const exportDate = dayjsStartDate().format("YYYY-MM-DD");
  const headerRows = [
    ["Travel Planning"],
    [`Travel date : ${startDateStr} to ${endDateStr}`],
    [`Export date : ${exportDate}`],
    [],
    []
  ];
  const tableHeader = [
    "Day",
    "Place",
    "Arrival Time",
    "Departure Time",
    "Stay/Sleep Time"
  ];
  const tableData = rows.map((r) => [
    r.Day,
    r.Node,
    r["Arrival Time"],
    r["Departure Time"],
    r["Stay/Sleep Time"]
  ]);
  const finalData = headerRows.concat([tableHeader]).concat(tableData);

  // ---------------------------
  // 8) Create Excel Workbook & Worksheet
  // ---------------------------
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Travel Plan");

  // Add all rows from finalData.
  finalData.forEach((row) => {
    worksheet.addRow(row);
  });

  // Merge first 5 header rows across columns A-E.
  for (let r = 1; r <= 5; r++) {
    worksheet.mergeCells(r, 1, r, 5);
  }
  // Style the main header cell.
  const headerCell = worksheet.getCell("A1");
  headerCell.font = { bold: true, size: 16 };
  headerCell.alignment = { vertical: "middle", horizontal: "center" };

  // Auto-adjust column widths based on content.
  for (let i = 0; i < 5; i++) {
    let maxWidth = 10;
    finalData.forEach((row) => {
      const cellValue = row[i] ? row[i].toString() : "";
      maxWidth = Math.max(maxWidth, cellValue.length);
    });
    worksheet.getColumn(i + 1).width = maxWidth;
  }

  // ---------------------------
  // 9) Process Merges & Final Styling
  // ---------------------------
  mergeRanges.forEach((range) => {
    worksheet.mergeCells(
      range.s.r + 1,
      range.s.c + 1,
      range.e.r + 1,
      range.e.c + 1
    );
    if (range.type === "departure" && range.lastRow !== undefined) {
      const mergedCell = worksheet.getCell(range.s.r + 1, range.s.c + 1);
      mergedCell.value = rows[range.lastRow]["Departure Time"];
    }
    if (range.type === "stay" && range.totalMinutes !== undefined) {
      const mergedCell = worksheet.getCell(range.s.r + 1, range.s.c + 1);
      const hours = Math.floor(range.totalMinutes / 60);
      const minutes = range.totalMinutes % 60;
      mergedCell.value = `${hours}h ${minutes}m`;
    }
  });

  // Style the table header row (row 6)
  const tableHeaderRow = worksheet.getRow(6);
  tableHeaderRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD3D3D3" }
    };
  });

  // Center-align the "Day" column (Column A)
  worksheet.getColumn(1).alignment = {
    vertical: "middle",
    horizontal: "center"
  };

  // Apply borders to cells in rows >= 6
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber >= 6) {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" }
        };
      });
    }
  });

  // Ensure the "Node" column (Column B) is center-aligned.
  worksheet.getColumn(2).alignment = {
    vertical: "middle",
    horizontal: "center"
  };

  // Set all cells to have center alignment.
  worksheet.eachRow((row) => {
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });
  });

  // ---------------------------
  // 10) Generate & Return Excel Blob
  // ---------------------------
  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], { type: "application/octet-stream" });
};




/**
 * convertExcelToImage:
 * - Converts an Excel Blob to an HTML table using XLSX.utils.sheet_to_html.
 * - Uses html2canvas to capture the rendered table as an image (data URL).
 */
export const convertExcelToImage = async (excelBlob: Blob): Promise<string> => {
  const arrayBuffer = await excelBlob.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const htmlString = XLSX.utils.sheet_to_html(worksheet);

  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';

  // Create and append custom CSS styles
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    table {
      border-collapse: collapse;
      width: 100%;
    }
    
    /* Default: apply thin borders and padding to every cell */
    table tr th,
    table tr td {
      border: 1px solid #000 !important;
      padding: 8px;
    }
    
    /* Remove borders from the first 5 rows (assumed header rows) */
    table tr:nth-child(-n+5) th,
    table tr:nth-child(-n+5) td {
      border: none !important;
    }
    
    /* Style the main header row ("Travel Planning") in row 1 */
    table tr:nth-child(1) th,
    table tr:nth-child(1) td {
      font-size: 16px;
      font-weight: bold;
      text-align: center;
      vertical-align: middle;
    }
    
    /* Style the table header row (assumed to be row 6) */
    table tr:nth-child(6) th,
    table tr:nth-child(6) td {
      font-weight: bold;
      text-align: center;
      vertical-align: middle;
      background-color: #D3D3D3; /* light gray background */
    }
    
    /* Align first column cells (e.g., formatted dates) to center */
    table tr th:first-child,
    table tr td:first-child {
      text-align: center;
      vertical-align: middle;
    }
    
    /* Ensure all cells are center aligned */
    table tr th,
    table tr td {
      text-align: center !important;
      vertical-align: middle !important;
    }
  `;
  container.appendChild(styleElement);

  // Append the generated HTML from the Excel sheet without overriding existing children.
  container.insertAdjacentHTML('beforeend', htmlString);
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container);
    return canvas.toDataURL('image/png');
  } finally {
    document.body.removeChild(container);
  }
};