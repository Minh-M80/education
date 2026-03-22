import type { Reporter, TestCase, TestModule, Vitest } from 'vitest/node';

interface UCStats {
  name: string;
  passed: number;
  failed: number;
  tests: { name: string; status: 'pass' | 'fail'; duration: number; description: string }[];
}

const UC_MAPPING: Record<string, { uc: string; name: string }> = {
  'AuthContext': { uc: 'UC1/UC2', name: 'Đăng ký & Đăng nhập' },
  'register': { uc: 'UC1', name: 'Đăng ký tài khoản' },
  'login': { uc: 'UC2', name: 'Đăng nhập' },
  'logout': { uc: 'UC2', name: 'Đăng nhập' },
  'CartContext': { uc: 'UC3', name: 'Giỏ hàng' },
  'MoMo': { uc: 'UC4', name: 'Thanh toán MoMo' },
  'momo': { uc: 'UC4', name: 'Thanh toán MoMo' },
  'Payment': { uc: 'UC4', name: 'Thanh toán MoMo' },
  'Enrollment': { uc: 'UC5/UC10', name: 'Xem bài giảng & Tiến độ' },
  'Quiz': { uc: 'UC6', name: 'Làm bài kiểm tra' },
  'Assignment': { uc: 'UC7/UC8', name: 'Nộp bài & Xem kết quả' },
  'Review': { uc: 'UC9', name: 'Đánh giá khóa học' },
  'Progress': { uc: 'UC10', name: 'Xem tiến độ học' },
  'CourseCard': { uc: 'UC3', name: 'Giỏ hàng' },
  'mockData': { uc: 'Support', name: 'Dữ liệu mẫu' },
  'lms': { uc: 'Support', name: 'Types & Interfaces' },
  'utils': { uc: 'Support', name: 'Utilities' },
};

function getUCFromTestName(fileName: string, testName: string): { uc: string; name: string } {
  for (const [key, value] of Object.entries(UC_MAPPING)) {
    if (fileName.includes(key) || testName.includes(key)) {
      return value;
    }
  }
  return { uc: 'Other', name: 'Khác' };
}

function extractDescription(testName: string): string {
  const parts = testName.split(' > ');
  return parts[parts.length - 1] || testName;
}

export default class UCReporter implements Reporter {
  private ucStats: Map<string, UCStats> = new Map();
  private startTime: number = 0;
  private ctx!: Vitest;

  onInit(ctx: Vitest) {
    this.ctx = ctx;
    this.startTime = Date.now();
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║           🎓 EduMaster LMS - Unit Test Report                ║');
    console.log('║              Phân loại theo Use Case                         ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
  }

  onTestCaseResult(testCase: TestCase) {
    const fileName = testCase.module.moduleId || '';
    const testName = testCase.fullName || testCase.name;
    const { uc, name } = getUCFromTestName(fileName, testName);
    const ucKey = `${uc}: ${name}`;

    if (!this.ucStats.has(ucKey)) {
      this.ucStats.set(ucKey, { name: ucKey, passed: 0, failed: 0, tests: [] });
    }

    const stats = this.ucStats.get(ucKey)!;
    const result = testCase.result();
    const status = result?.state === 'passed' ? 'pass' : 'fail';
    const duration = testCase.diagnostic()?.duration || 0;

    if (status === 'pass') {
      stats.passed++;
    } else {
      stats.failed++;
    }

    const statusIcon = status === 'pass' ? '✓' : '✗';
    const desc = extractDescription(testName);
    console.log(`  ${statusIcon} [${uc}] ${desc} (${duration.toFixed(0)}ms)`);

    stats.tests.push({
      name: testName,
      status,
      duration,
      description: desc,
    });
  }

  onTestRunEnd() {
    const totalDuration = Date.now() - this.startTime;
    let totalPassed = 0;
    let totalFailed = 0;

    // Sort UCs
    const sortedUCs = Array.from(this.ucStats.entries()).sort((a, b) => {
      const aUC = a[0].match(/UC(\d+)/)?.[1] || '99';
      const bUC = b[0].match(/UC(\d+)/)?.[1] || '99';
      return parseInt(aUC) - parseInt(bUC);
    });

    console.log('\n\n════════════════════════════════════════════════════════════════');
    console.log('                    📋 PHÂN LOẠI THEO USE CASE                    ');
    console.log('════════════════════════════════════════════════════════════════\n');

    for (const [ucName, stats] of sortedUCs) {
      totalPassed += stats.passed;
      totalFailed += stats.failed;

      const statusIcon = stats.failed === 0 ? '✅' : '❌';
      const passRate = ((stats.passed / (stats.passed + stats.failed)) * 100).toFixed(0);

      console.log(`${statusIcon} ${ucName}`);
      console.log(`   Passed: ${stats.passed} | Failed: ${stats.failed} | Rate: ${passRate}%`);
      console.log('');
    }

    // Summary
    console.log('════════════════════════════════════════════════════════════════');
    console.log('                         📊 TỔNG KẾT                             ');
    console.log('════════════════════════════════════════════════════════════════');
    console.log(`  ✅ Passed: ${totalPassed}`);
    console.log(`  ❌ Failed: ${totalFailed}`);
    console.log(`  ⏱️  Thời gian: ${(totalDuration / 1000).toFixed(2)}s`);
    console.log(`  📁 Use Cases: ${this.ucStats.size}`);
    console.log('════════════════════════════════════════════════════════════════\n');

    if (totalFailed > 0) {
      console.log('⚠️  Một số test đã thất bại. Vui lòng kiểm tra lại!\n');
    } else {
      console.log('🎉 Tất cả tests đều pass! Excellent!\n');
    }
  }
}
