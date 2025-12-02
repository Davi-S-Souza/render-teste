
package com.corrigeaqui.repositories;

import com.corrigeaqui.models.Report;
import com.corrigeaqui.models.User;
import com.corrigeaqui.models.enums.ReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByReporter(User reporter);
    List<Report> findByStatus(ReportStatus status);
}
