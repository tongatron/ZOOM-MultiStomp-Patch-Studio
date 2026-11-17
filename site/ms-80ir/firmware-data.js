// MS-80IR+ firmware data per effect, aligned with EFFECTS_DATA. Source: mungewell/zoom-zt2 (MIT), zoom_fx_HGL/zoom_fx/MS80IRPLUS/list_sorted.txt.
// The IR effect is not in that list, so it has no ID and no DSP load. Written by tools/ms80ir-data.py.
// Format: [DSP %, display name, effect ID, ZD2 file, version]

const DSP_SCALE = 0.925;

const FIRMWARE_DATA = [
  [66.46, "MS 45os", "0x04000012", "MS45OSST.ZD2", "1.00"],
  [64.6, "MS 1959", "0x04000022", "MS1959ST.ZD2", "1.00"],
  [71.04, "MS 800", "0x04000032", "MS800_ST.ZD2", "1.00"],
  [55.15, "FD B-MAN", "0x04000041", "FDBMANST.ZD2", "1.00"],
  [72.04, "FD TWIN-R", "0x04000052", "FD_TWRST.ZD2", "1.00"],
  [63.9, "FD DLX-R", "0x04000062", "FDDLXRST.ZD2", "1.00"],
  [71.54, "FD MASTER", "0x04000072", "FDMSTRST.ZD2", "1.00"],
  [69.03, "UK 30A", "0x04000082", "UK30A_ST.ZD2", "1.00"],
  [76.77, "BG MARK1", "0x04000092", "BGMK1_ST.ZD2", "1.00"],
  [75.96, "BG MARK3", "0x040000a2", "BGMK3_ST.ZD2", "1.00"],
  [64.35, "RectiDual", "0x040000b2", "RCTORGST.ZD2", "1.00"],
  [67.62, "XtasyBlue", "0x040000c2", "XTSBL_ST.ZD2", "1.00"],
  [70.64, "HW 100", "0x040000d2", "HW100_ST.ZD2", "1.00"],
  [71.14, "ORG120", "0x040000e2", "ORG120ST.ZD2", "1.00"],
  [66.86, "DZ DRIVE", "0x040000f2", "DZ_DRVST.ZD2", "1.00"],
  [70.38, "MATCH30", "0x04000102", "MACH30ST.ZD2", "1.00"],
  [69.23, "KRAMPUS", "0x04000112", "KRMPS_ST.ZD2", "1.00"],
  [71.14, "REDLOOM", "0x04000122", "REDLM_ST.ZD2", "1.00"],
  [73.85, "VELVET", "0x04000132", "VELVT_ST.ZD2", "1.00"],
  [74.46, "MUDDY", "0x04000142", "MUDDY_ST.ZD2", "1.00"],
  [69.13, "7 HEAVEN", "0x04000152", "7HEVN_ST.ZD2", "1.00"],
  [72.24, "POLLEX", "0x04000162", "POLEX_ST.ZD2", "1.00"],
  [74.4, "WH CANVAS", "0x04000172", "WCANVAS.ZD2", "1.00"],
  [22.64, "WoodyStd.", "0x0f000020", "STUDIO2.ZD2", "1.00"],
  [22.64, "UrbanStd.", "0x0f000030", "STUDIO3.ZD2", "1.00"],
  [22.64, "MusicClub", "0x0f000040", "STUDIO4.ZD2", "1.00"],
  [22.64, "C. Hall", "0x0f000050", "STUDIO5.ZD2", "1.00"],
  [22.64, "L Chapel", "0x0f000060", "STUDIO6.ZD2", "1.00"],
  [null, "", null, null, null],
  [6.81, "NoiseGate", "0x06000010", "N_GATE.ZD2", "1.00"],
  [4.35, "ZNR", "0x06000020", "ZNR.ZD2", "1.00"],
  [10.74, "St Gt GEQ", "0x06000038", "STGTGE1U.ZD2", "1.00"],
  [5.74, "St GtGEQ7", "0x06000048", "STGTGE7.ZD2", "1.00"],
  [5.08, "St ParaEQ", "0x06000058", "STPARAEQ.ZD2", "1.00"],
  [4.43, "St Low EQ", "0x06000068", "STLOWEQ.ZD2", "1.00"],
  [3.32, "St HighEQ", "0x06000078", "STHIGHEQ.ZD2", "1.00"],
  [0.0, "BPM", "0x06000ff0", "BPM_MDL.ZD2", "1.00"],
  [5.5, "Delay", "0x08000012", "DELAY_I.ZD2", "1.10"],
  [5.5, "AnalogDly", "0x08000022", "ANDLY_I.ZD2", "1.10"],
  [6.97, "TapeEcho", "0x08000032", "TAPECH_I.ZD2", "1.10"],
  [6.64, "StereoDly", "0x0800007b", "STDLY_I.ZD2", "1.00"]
];
