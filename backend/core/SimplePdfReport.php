<?php

class SimplePdfReport
{
    private array $pages = [];
    private string $currentPage = '';
    private float $pageWidth = 595.28;
    private float $pageHeight = 841.89;
    private float $cursorY = 800.0;
    private string $font = 'Helvetica';
    private float $fontSize = 12.0;

    public function __construct()
    {
        $this->addPage();
    }

    public function addPage(): void
    {
        if ($this->currentPage !== '') {
            $this->pages[] = $this->currentPage;
        }

        $this->currentPage = '';
        $this->cursorY = 800.0;
        $this->setFont('Helvetica', 12.0);
    }

    public function setFont(string $font, float $size): void
    {
        $this->font = $font;
        $this->fontSize = $size;
    }

    public function line(string $text, float $x = 40.0, ?float $y = null): void
    {
        if ($y === null) {
            $y = $this->cursorY;
        }

        if ($y < 60) {
            $this->addPage();
            $y = $this->cursorY;
        }

        $escaped = $this->escape($text);
        $fontName = $this->font === 'Courier' ? '/F2' : '/F1';
        $this->currentPage .= sprintf(
            "BT %s %.2F Tf %.2F %.2F Td (%s) Tj ET\n",
            $fontName,
            $this->fontSize,
            $x,
            $y,
            $escaped
        );

        $this->cursorY = $y - ($this->fontSize + 6);
    }

    public function spacer(float $height = 10.0): void
    {
        $this->cursorY -= $height;
    }

    public function output(string $filename): void
    {
        if ($this->currentPage !== '') {
            $this->pages[] = $this->currentPage;
            $this->currentPage = '';
        }

        $objects = [];
        $font1 = count($objects) + 1;
        $objects[] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
        $font2 = count($objects) + 1;
        $objects[] = "<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>";

        $contentIds = [];
        $pageIds = [];

        foreach ($this->pages as $pageContent) {
            $contentId = count($objects) + 1;
            $stream = "<< /Length " . strlen($pageContent) . " >>\nstream\n" . $pageContent . "endstream";
            $objects[] = $stream;
            $contentIds[] = $contentId;

            $pageId = count($objects) + 1;
            $objects[] = '';
            $pageIds[] = $pageId;
        }

        $pagesId = count($objects) + 1;
        $objects[] = '';

        foreach ($pageIds as $index => $pageId) {
            $objects[$pageId - 1] = sprintf(
                "<< /Type /Page /Parent %d 0 R /MediaBox [0 0 %.2F %.2F] /Resources << /Font << /F1 %d 0 R /F2 %d 0 R >> >> /Contents %d 0 R >>",
                $pagesId,
                $this->pageWidth,
                $this->pageHeight,
                $font1,
                $font2,
                $contentIds[$index]
            );
        }

        $kids = implode(' ', array_map(static fn ($id) => $id . ' 0 R', $pageIds));
        $objects[$pagesId - 1] = "<< /Type /Pages /Kids [ $kids ] /Count " . count($pageIds) . " >>";

        $catalogId = count($objects) + 1;
        $objects[] = "<< /Type /Catalog /Pages $pagesId 0 R >>";

        $pdf = "%PDF-1.4\n";
        $offsets = [0];
        foreach ($objects as $index => $object) {
            $offsets[] = strlen($pdf);
            $pdf .= ($index + 1) . " 0 obj\n" . $object . "\nendobj\n";
        }

        $xrefOffset = strlen($pdf);
        $pdf .= "xref\n0 " . (count($objects) + 1) . "\n";
        $pdf .= "0000000000 65535 f \n";
        for ($i = 1; $i < count($offsets); $i++) {
            $pdf .= sprintf("%010d 00000 n \n", $offsets[$i]);
        }

        $pdf .= "trailer << /Size " . (count($objects) + 1) . " /Root $catalogId 0 R >>\n";
        $pdf .= "startxref\n$xrefOffset\n%%EOF";

        header('Content-Type: application/pdf');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Content-Length: ' . strlen($pdf));
        echo $pdf;
        exit;
    }

    private function escape(string $text): string
    {
        $converted = iconv('UTF-8', 'Windows-1252//TRANSLIT//IGNORE', $text);
        if ($converted === false) {
            $converted = $text;
        }

        return str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $converted);
    }
}
