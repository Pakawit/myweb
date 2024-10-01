import React from 'react';

const Handbook = () => {
  return (
    <div className="container mt-5">
      <h1 className="text-primary">คู่มือการดูแลตนเองเพื่อลดระดับความรุนแรงอาการฝ่ามือฝ่าเท้าอักเสบ</h1>
      <h2 className="text-secondary">สำหรับผู้ป่วยมะเร็งลำไส้ใหญ่และทวารหนักที่ได้รับยาเคปไซตาบีน</h2>

      <section className="mt-4">
        <h3 className="text-info">เรียบเรียงโดย</h3>
        <p>พว. อพัชนิภา บุญหลี</p>
      </section>

      <section className="mt-4">
        <h3 className="text-info">สารบัญ</h3>
        <ul className="list-unstyled">
          <li><a href="#chapter1" className="text-decoration-none text-primary">บทที่ 1 การรักษาผู้ป่วยมะเร็งลำไส้ใหญ่และทวารหนักด้วยยาเคปไซตาบีน</a></li>
          <li><a href="#chapter2" className="text-decoration-none text-primary">บทที่ 2 อาการฝ่ามือฝ่าเท้าอักเสบ</a></li>
          <li><a href="#chapter3" className="text-decoration-none text-primary">บทที่ 3 การประเมินอาการฝ่ามือฝ่าเท้าอักเสบ</a></li>
          <li><a href="#chapter4" className="text-decoration-none text-primary">บทที่ 4 การดูแลตนเองเพื่อลดระดับความรุนแรงของอาการฝ่ามือฝ่าเท้าอักเสบ</a></li>
          <li><a href="#chapter5" className="text-decoration-none text-primary">บทที่ 5 การบริหารยาเคปไซตาบีน</a></li>
        </ul>
      </section>

      <section id="chapter1" className="mt-4">
        <h3 className="text-info">บทที่ 1: การรักษาผู้ป่วยมะเร็งลำไส้ใหญ่และทวารหนักด้วยยาเคปไซตาบีน</h3>
        <p>ยาเคปไซตาบีนเป็นยาต้านมะเร็งชนิดรับประทานที่ได้รับการรับรอง...</p>
      </section>

      <section id="chapter2" className="mt-4">
        <h3 className="text-info">บทที่ 2: อาการฝ่ามือฝ่าเท้าอักเสบ</h3>
        <p>อาการฝ่ามือฝ่าเท้าอักเสบ (Hand Foot Syndrome) เป็นปฏิกิริยาทางผิวหนัง...</p>
      </section>

      <section id="chapter3" className="mt-4">
        <h3 className="text-info">บทที่ 3: การประเมินอาการฝ่ามือฝ่าเท้าอักเสบ</h3>
        <p>การประเมินอาการฝ่ามือฝ่าเท้าอักเสบสามารถแบ่งได้เป็น 3 ระดับ...</p>
      </section>

      <section id="chapter4" className="mt-4">
        <h3 className="text-info">บทที่ 4: การดูแลตนเองเพื่อลดระดับความรุนแรงของอาการฝ่ามือฝ่าเท้าอักเสบ</h3>
        <ul>
          <li>ทำความสะอาดมือและเท้า</li>
          <li>ใช้ครีมเพิ่มความชุ่มชื้น...</li>
          <li>สวมรองเท้าที่ระบายอากาศได้ดี...</li>
        </ul>
      </section>

      <section id="chapter5" className="mt-4">
        <h3 className="text-info">บทที่ 5: การบริหารยาเคปไซตาบีน</h3>
        <p>การรับประทานยาเคปไซตาบีนอย่างถูกต้องสามารถทำได้โดย...</p>
      </section>
    </div>
  );
};

export default Handbook;